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
        // Agar pipeline tidak berhenti jika test gagal
        catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
          sh 'npm test'
        }
      }
    }

    stage('Sync to Deploy Dir') {
      steps {
        // Sinkron dari workspace Jenkins ke folder deploy di VPS
        sh "rsync -av --delete ${env.WORKSPACE}/ ${DEPLOY_DIR}/"
      }
    }

    stage('Build & Deploy') {
      steps {
        dir("${DEPLOY_DIR}") {
          // Hentikan container lama (abaikan error jika belum ada)
          sh 'docker-compose down || true'
          // Build image baru
          sh 'docker-compose build'
          // Jalankan ulang container
          sh 'docker-compose up -d'
        }
      }
    }
  }

  post {
    success {
      echo '✅ Deploy selesai!'
    }
    unstable {
      echo '⚠️ Build UNSTABLE (tests gagal), tapi deploy tetap dijalankan.'
    }
    failure {
      echo '❌ Pipeline gagal sebelum deploy.'
    }
  }
}
