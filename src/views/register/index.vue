<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="registerForm " :rules="registerRules" class="login-form">

      <div class="title-container">
        <h3 class="title">用户注册</h3>
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="registerForm.username"
          placeholder="用户名，仅可包含中英文及下划线"
          type="text"
          tabindex="1"
          @blur="reload"
        />
      </el-form-item>

      <el-form-item prop="realname">
        <span class="svg-container">
          <svg-icon icon-class="people" />
        </span>
        <el-input
          ref="realname"
          v-model="registerForm.realname"
          placeholder="真实名"
          type="text"
          tabindex="1"
        />
      </el-form-item>

      <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual>
        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="registerForm.password"
            :type="passwordType"
            placeholder="密码"
            tabindex="2"
            autocomplete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
      </el-tooltip>
      <el-tooltip v-model="recapsTooltip" content="Caps lock is On" placement="right" manual>
        <el-form-item prop="repassword">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :key="repasswordType"
            ref="repassword"
            v-model="registerForm.repassword"
            :type="repasswordType"
            placeholder="确认密码"
            tabindex="3"
            autocomplete="on"
            @keyup.native="recheckCapslock"
            @blur="recapsTooltip = false"
          />
          <span class="show-pwd" @click="reshowPwd">
            <svg-icon :icon-class="repasswordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
      </el-tooltip>

      <!-- 手机 -->
      <el-form-item prop="phone">
        <span class="svg-container">
          <svg-icon icon-class="wechat" />
        </span>
        <el-input
          ref="phone"
          v-model="registerForm.phone"
          placeholder="请输入手机号"
          name="phone"
          type="text"
          tabindex="4"
        />
      </el-form-item>

      <!-- 邮箱 -->
      <el-form-item prop="email">
        <span class="svg-container">
          <svg-icon icon-class="email" />
        </span>
        <el-input
          ref="email"
          v-model="registerForm.email"
          placeholder="请输入邮箱"
          name="email"
          type="text"
          tabindex="5"
        />
      </el-form-item>
      <!-- 验证码 -->
      <el-form-item prop="verifycode">
        <span class="svg-container">
          <svg-icon icon-class="guide" />
        </span>
        <el-input
          ref="verifycode"
          v-model="registerForm.verifycode"
          placeholder="请输入验证码"
          name="verifycode"
          type="text"
          tabindex="6"
          style="width:70%;"
        />
        <img :src="verifycodeImg" alt="" @click="reload">
      </el-form-item>

      <el-button type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="userRegister">注册</el-button>

    </el-form>
  </div>
</template>

<script>
import { register } from '@/api/user'
import { validEmail, validPhone, validRealname, validUsername, validVerifyCode } from '@/utils/validate'

export default {
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('请输入正确的用户名'))
      } else {
        callback()
      }
    }
    const validateRealname = (rule, value, callback) => {
      if (!validRealname(value)) {
        callback(new Error('请输入正确的真实名'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('密码不能少于6位'))
      } else {
        callback()
      }
    }
    const validateRepassword = (rule, value, callback) => {
      if (value !== this.registerForm.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
    const validateEmail = (rule, value, callback) => {
      if (!validEmail(value)) {
        callback(new Error('请输入正确的邮箱地址'))
      } else {
        callback()
      }
    }
    const validatePhone = (rule, value, callback) => {
      if (!validPhone(value)) {
        callback(new Error('请输入正确的手机号'))
      } else {
        callback()
      }
    }
    const validateVerifyCode = (rule, value, callback) => {
      if (!validVerifyCode(value)) {
        callback(new Error('请检查验证码'))
      } else {
        callback()
      }
    }
    return {
      registerForm: {
        username: '',
        realname: '',
        password: '',
        repassword: '',
        phone: '',
        email: '',
        verifycode: ''
      },
      registerRules: {
        username: [{ required: true, trigger: 'change', validator: validateUsername }],
        realname: [{ required: true, trigger: 'blur', validator: validateRealname }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        repassword: [{ required: true, trigger: 'blur', validator: validateRepassword }],
        phone: [{ required: true, trigger: 'blur', validator: validatePhone }],
        email: [{ required: true, trigger: 'blur', validator: validateEmail }],
        verifycode: [{ required: true, trigger: 'blur', validator: validateVerifyCode }]
      },
      capsTooltip: false,
      passwordType: 'password',
      recapsTooltip: false,
      repasswordType: 'password',
      verifycodeImg: ''
    }
  },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    checkCapslock(e) {
      const { key } = e
      this.capsTooltip = key && key.length === 1 && (key >= 'A' && key <= 'Z')
    },
    reshowPwd() {
      if (this.repasswordType === 'password') {
        this.repasswordType = ''
      } else {
        this.repasswordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.repassword.focus()
      })
    },
    recheckCapslock(e) {
      const { key } = e
      this.recapsTooltip = key && key.length === 1 && (key >= 'A' && key <= 'Z')
    },
    reload() {
      this.verifycodeImg = `${process.env.VUE_APP_BASE_API}/verify-code/${this.registerForm.username}?t=` + new Date().getTime()
    },
    async userRegister() {
      const { data } = await register(this.registerForm)
      this.$message({
        message: data,
        type: 'success'
      })
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="scss">

$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0;
      -webkit-appearance: none;
      border-radius: 0;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0 auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}
</style>

