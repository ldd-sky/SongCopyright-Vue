<template>
  <div class="container">
    <div class="search-input">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="请输入歌曲名，若有歌手，则格式为：歌曲名-歌手"
        class="search-box"
        @keyup.enter="searchSongs"
      >
      <el-button :loading="loading" style="margin-left:16px;" size="middle" type="primary" @click="searchSongs">
        搜索
      </el-button>
      <UploadExcel :on-success="handleExcelUploadSuccess" />
    </div>

    <div class="results">
      <div v-for="song in paginatedSongs" :key="song.id" class="card">
        <h3>{{ song.songTitle }}</h3>
        <p><strong>演唱歌手：</strong> {{ song.artist }}</p>
        <p><strong>所属专辑：</strong> {{ song.album }}</p>
        <p><strong>发行日期：</strong> {{ song.date }}</p>
        <p><strong>发行公司：</strong> {{ song.originalCompany }}</p>
      </div>
    </div>

    <div v-show="showPagination" class="pagination">
      <el-button
        type="primary"
        size="small"
        style="margin-right:16px;"
        :disabled="currentPage === 1"
        @click="prevPage"
      >
        上一页
      </el-button>
      <span>{{ currentPage }} of {{ totalPages }}</span>
      <el-button
        type="primary"
        size="small"
        style="margin-left:16px;"
        :disabled="currentPage === totalPages"
        @click="nextPage"
      >
        下一页
      </el-button>
    </div>

    <el-dialog
      :visible.sync="showModal"
      title="在线查询"
      width="30%"
    >
      <p>没有找到结果。是否进行在线查询？</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelOnlineSearch">取消</el-button>
        <el-button type="primary" @click="confirmOnlineSearch">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import UploadExcel from '../components/UploadExcel.vue'
import { getToken } from '@/utils/auth'

export default {
  components: {
    UploadExcel
  },
  data() {
    return {
      loading: false,
      searchQuery: '',
      file: null,
      songs: [],
      currentPage: 1,
      pageSize: 4,
      showModal: false,
      totalPages: 0
    }
  },
  computed: {
    sortedSongs() {
      return this.songs.slice().sort((a, b) => new Date(a.date) - new Date(b.date))
    },
    paginatedSongs() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.sortedSongs.slice(start, end)
    },
    showPagination() {
      return this.songs.length !== 0
    }
  },
  methods: {
    searchSongs() {
      const apiUrl = '/v1/song/page-songCopyright'
      this.loading = true

      axios.get(apiUrl, {
        params: {
          songTitle: this.searchQuery,
          current: this.currentPage,
          size: this.pageSize
        },
        headers: {
          'X-Token': getToken()
        }
      })
        .then(response => {
          if (response.data && response.data.records) {
            this.songs = response.data.records
            if (response.data.total === -1) {
              this.showModal = true
            } else {
              this.totalPages = Math.ceil(this.songs.length / this.pageSize)
              this.currentPage = response.data.current
              this.loading = false
            }
          } else {
            this.loading = false
            console.error('Invalid response format:', response.data)
          }
        })
        .catch(error => {
          this.loading = false
          console.error('Error during song search:', error)
        })
    },
    confirmOnlineSearch() {
      this.showModal = false
      this.onlineSearch()
    },
    onlineSearch() {
      const apiUrl = '/v1/song/page-songCopyrightSearch'
      axios.get(apiUrl, {
        params: {
          songTitle: this.searchQuery,
          current: this.currentPage,
          size: this.pageSize
        },
        headers: {
          'X-Token': getToken()
        }
      })
        .then(response => {
          this.loading = false
          if (response.data && response.data.records) {
            this.songs = response.data.records
            if (response.data.total === -2) {
              this.$message.error('请使用Chrome浏览器登陆网易云网页版保留Cookie后重试！')
            } else if (response.data.total !== 0) {
              this.totalPages = Math.ceil(this.songs.length / this.pageSize)
              this.currentPage = response.data.current
            }
          } else {
            console.error('Invalid response format:', response.data)
          }
        })
        .catch(error => {
          this.loading = false
          console.error('Error during song search:', error)
        })
    },
    cancelOnlineSearch() {
      this.loading = false
      this.showModal = false
    },
    handleExcelUploadSuccess(excelData, rawFile) {
      console.log('Excel upload success:', excelData)
      this.uploadExcel(rawFile)
    },
    uploadExcel(file) {
      if (!file) {
        console.error('No file to upload.')
        return
      }
      const formData = new FormData()
      formData.append('excelFile', file)
      axios.post('/v1/song/handle-excel-song', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Token': getToken()
        }
      })
        .then(response => {
          console.log('File upload response:', response.data)
        })
        .catch(error => {
          console.error('Error during file upload:', error)
        })
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}
.search-input {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
}
.search-box {
  border: 1px solid #e4e4e4;
  box-sizing: border-box;
  width: 500px;
  height: 40px;
  font-size: 18px;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 5px;
}
.results {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: left;
}
.card h3 {
  margin-top: 0;
}
.card p {
  margin: 4px 0;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>
