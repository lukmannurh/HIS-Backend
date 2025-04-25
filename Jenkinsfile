pipeline {
  agent any

  tools {
    nodejs "20.x"  
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

    stage('Build Docker Image') {
      steps {
        dir('/opt/HIS-Backend') {
          sh 'docker-compose build'
        }
      }
    }

    stage('Deploy to VPS') {
      steps {
        dir('/opt/HIS-Backend') {
          sh 'docker-compose down'
          sh 'docker-compose up -d'
        }
      }
    }
  }

  post {
    success {
      echo '✅ CI/CD berhasil: HIS-Backend ter‐deploy!'
    }
    failure {
      echo '❌ CI/CD gagal, cek log di Jenkins.'
    }
  }
}
