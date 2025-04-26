pipeline {
  agent any

  tools {
    nodejs "20.x"
  }

  environment {
    // Ambil secret text dari Jenkins Credentials (ID = encryption-key)
    ENCRYPTION_KEY           = credentials('encryption-key')
    // Sesuaikan dengan ekspektasi test token.js
    JWT_EXPIRES_IN           = '15m'
    JWT_REFRESH_EXPIRES_IN   = '7d'
    // Folder deployment Anda
    DEPLOY_DIR               = '/opt/HIS-Backend'
  }

 stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    stage('Install & Test') {
      steps {
        sh 'npm install'
        // dummy test, atau test yang Anda butuhkan
        sh 'npm test -- src/tests/dummy.test.js'
      }
    }
    stage('Deploy via SSH') {
      steps {
        // gunakan SSH-Agent plugin, credentials ID 'vps-deploy-ssh'
        sshagent (credentials: ['vps-deploy-ssh']) {
          sh '''
            ssh -o StrictHostKeyChecking=no deployer@203.194.112.226 << 'EOF'
              set -xe
              cd /opt/HIS-Backend
              git pull origin main
              docker-compose down
              docker-compose up -d --build
            EOF
          '''
        }
      }
    }
  }
  post {
    success {
      echo '✅ Deployment sukses!'
    }
    failure {
      echo '❌ Gagal deploy, cek log.'
    }
  }
}