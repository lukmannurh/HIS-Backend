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
            docker-compose stop api    || true
            docker-compose rm -f api   || true
            sleep 3
          '''
        }
      }
    }
    stage('Deploy') {
      steps {
        dir("${DEPLOY_DIR}") {
          sh 'git pull origin main'
          sh 'docker-compose up -d --force-recreate api'
        }
      }
    }
  }
  post {
    success { echo "✅ Deploy sukses!" }
    failure { echo "❌ Deploy gagal, cek log untuk detail." }
  }
}
