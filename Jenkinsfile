// Jenkinsfile

pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                // Clone source code
                git branch: 'main', url: 'https://github.com/lukmannurh/HIS-Backend.git'
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t my-hoax-checker-app:latest .'
            }
        }

        // Optional: push image to registry
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

        // Optional: Deploy using docker-compose
        stage('Deploy') {
            steps {
                // Example: 
                sh 'docker-compose down'
                sh 'docker-compose up -d --build'
            }
        }
    }

    post {
        always {
            // cleanup
            sh 'docker logout || true'
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
