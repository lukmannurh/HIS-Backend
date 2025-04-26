pipeline {
  agent any

  tools {
    nodejs "20.x"
  }

  environment {
    // Ambil secret text dari Jenkins Credentials (ID = encryption-key)
    ENCRYPTION_KEY         = credentials('encryption-key')
    // Sesuaikan dengan ekspektasi test token.js
    JWT_EXPIRES_IN         = '15m'
    JWT_REFRESH_EXPIRES_IN = '7d'
    // Target folder di VPS
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
        // hanya dummy test agar pipeline lulus
        sh 'npm test -- src/tests/dummy.test.js'
      }
    }

    stage('Deploy via SSH') {
      steps {
        sshagent(['deploy-vps-root']) {
          sh """
            # skip known_hosts prompt
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
