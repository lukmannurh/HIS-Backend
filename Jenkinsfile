pipeline {
  agent { label 'vps' }

  environment {
    DEPLOY_DIR = "/opt/his-deploy"
    COMPOSE_FILE = "${DEPLOY_DIR}/docker-compose.yml"
  }

  stages {
    stage('Checkout') {
      steps {
        // clone repo ke workspace Jenkins
        checkout scm
      }
    }

    stage('Build & Test') {
      steps {
        // 1) Install dependencies
        sh 'npm ci'
        // 2) (Opsional) run tests
        sh 'npm test -- src/tests/dummy.test.js'
      }
    }

    stage('Build Docker Image') {
      steps {
        // kita anggap docker-compose.yml punya service "api"
        sh "cd ${DEPLOY_DIR} && docker-compose build api"
      }
    }

    stage('Deploy to VPS') {
      steps {
        // jalankan/update container "api" saja
        sh "cd ${DEPLOY_DIR} && docker-compose up -d api"
      }
    }
  }

  post {
    success {
      echo "✅ Deployment berhasil!"
    }
    failure {
      echo "❌ Deployment GAGAL, cek log di atas."
    }
  }
}



 