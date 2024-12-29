pipeline {
    agent any

    environment {
        // Mendefinisikan versi Node.js
        NODE_VERSION = '20.x'
        // Mendefinisikan variabel lingkungan (jika ada)
        // Untuk keamanan, variabel sensitif harus disimpan di kredensial Jenkins
    }

    tools {
        // Instalasi Node.js menggunakan plugin NodeJS
        nodejs NODE_VERSION
    }

    stages {
        stage('Checkout') {
            steps {
                // Clone source code
                git branch: 'main', url: 'https://github.com/lukmannurh/HIS-Backend.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm run test'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t my-hoax-checker-app:latest .'
            }
        }

        stage('Push Docker Image') {
            when {
                expression { return env.PUSH_DOCKER == 'true' }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-cred', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                    sh 'docker tag my-hoax-checker-app:latest my-dockerhub-namespace/my-hoax-checker-app:latest'
                    sh 'docker push my-dockerhub-namespace/my-hoax-checker-app:latest'
                }
            }
        }

        stage('Deploy') {
            steps {
                // Deploy menggunakan docker-compose
                sh 'docker-compose down'
                sh 'docker-compose up -d --build'
            }
        }
    }

    post {
        always {
            // Cleanup
            sh 'docker logout || true'
            cleanWs()
        }
        success {
            echo 'Pipeline berhasil!'
        }
        failure {
            echo 'Pipeline gagal!'
        }
    }
}
