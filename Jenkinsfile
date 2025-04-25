pipeline {
  agent any

  tools {
    nodejs "20.x"
  }

  environment {
    DEPLOY_DIR = '/opt/HIS-Backend'
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
        sh 'npm test'
      }
    }

    stage('Sync to Deploy Dir') {
      steps {
        sh """
          rsync -av --delete ${env.WORKSPACE}/ ${DEPLOY_DIR}/
        """
      }
    }

    stage('Build & Deploy') {
      steps {
        dir("${DEPLOY_DIR}") {
          sh 'docker-compose down || true'
          sh 'docker-compose build'
          sh 'docker-compose up -d'
        }
      }
    }
  }

  post {
    success {
      echo '✅ Build & deploy sukses!'
    }
    failure {
      echo '❌ Ada error, cek log build.'
    }
  }
}
