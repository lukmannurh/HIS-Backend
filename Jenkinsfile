pipeline {
  agent any
  environment {
    DEPLOY_DIR = '/opt/his-deploy'
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    stage('Build & Test') {
      steps {
        sh 'npm ci'
        sh 'npm test -- src/tests/dummy.test.js'
      }
    }
    stage('Pre-Deploy Cleanup') {
      steps {
        dir("${DEPLOY_DIR}") {
          sh '''
            docker-compose stop api || true
            docker-compose rm -f api  || true
            sleep 3
          '''
        }
      }
    }
    stage('Deploy') {
      steps {
        // 1) Update kode backend
        dir("${DEPLOY_DIR}/his-api") {
          sh 'git pull origin main'
        }
        // 2) Relaunch container
        dir("${DEPLOY_DIR}") {
          sh 'docker-compose up -d --force-recreate api'
        }
      }
    }
  }
  post {
    success {
      echo "✅ Deploy sukses!"
    }
    failure {
      echo "❌ Deploy gagal, cek log untuk detail."
    }
  }
}
