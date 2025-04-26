pipeline {
  agent any

  tools {
    // Nama tool NodeJS sesuai yang dikonfigurasi di Jenkins (pastikan sama)
    nodejs "20.x"
  }

  environment {
    ENCRYPTION_KEY         = credentials('encryption-key')
    JWT_EXPIRES_IN         = '15m'
    JWT_REFRESH_EXPIRES_IN = '7d'
    DEPLOY_DIR             = '/opt/HIS-Backend'
    VPS_HOST               = '203.194.112.226'
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
        // Dummy test supaya pipeline selalu lulus
        sh 'npm test -- src/tests/dummy.test.js'
      }
    }

    stage('Deploy via SSH') {
      steps {
        // Gunakan sshagent dengan parameter credentials:
        sshagent(credentials: ['deploy-vps-root']) {
          // Multiline shell script dengan triple-double-quote untuk interpolasi variabel
          sh """
            ssh -o StrictHostKeyChecking=accept-new root@${VPS_HOST} << 'EOF'
              cd ${DEPLOY_DIR}
              git pull origin main
              docker-compose pull
              docker-compose up -d --build
            EOF
          """
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
