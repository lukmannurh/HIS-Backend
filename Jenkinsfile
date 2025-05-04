pipeline {
  agent { label 'vps' }  // jalankan di agent yang sudah ada docker & node
  environment {
    DEPLOY_DIR = '/opt/his-deploy'
  }
  stages {
    stage('Checkout') {
      steps { checkout([$class: 'GitSCM',
                       branches: [[name: '*/main']],
                       userRemoteConfigs: [[url: 'https://github.com/lukmannurh/HIS-Backend.git']]]) }
    }
    stage('Build & Test') {
      steps {
        dir("${WORKSPACE}") {
          sh 'npm ci'
          sh 'npm test -- src/tests/dummy.test.js'
        }
      }
    }
    stage('Deploy') {
      steps {
        dir("${DEPLOY_DIR}/his-api") {
          sh 'git pull origin main'
        }
        dir("${DEPLOY_DIR}") {
          sh 'docker-compose build api'
          sh 'docker-compose up -d api'
        }
      }
    }
  }
  post {
    success { echo "✅ Deploy sukses!" }
    failure { echo "❌ Deploy gagal, periksa log." }
  }
}
