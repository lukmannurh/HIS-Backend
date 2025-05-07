pipeline {
  agent any // Menjalankan pipeline di agent manapun yang tersedia
  environment {
    // Direktori tempat aplikasi di-deploy pada VPS
    DEPLOY_DIR = '/opt/his-deploy'
  }
  stages {
    stage('Checkout') {
      steps {
        // Mengambil kode source pipeline (Jenkinsfile) dan konfigurasi SCM
        checkout scm
      }
    }
    stage('Build & Test') {
      steps {
        // Instalasi dependensi Node.js secara bersih
        sh 'npm ci'
        // Menjalankan satu unit test dummy untuk memastikan pipeline bekerja
        sh 'npm test -- src/tests/dummy.test.js'
      }
    }
    stage('Pre-Deploy Cleanup') {
      steps {
        // Pindah ke direktori deploy sebelum menghentikan container
        dir("${DEPLOY_DIR}") {
          sh '''
            # Hentikan service API jika sedang berjalan (abaikan error jika tidak ada)
            docker-compose stop api || true
            # Hapus container API agar selalu fresh saat deploy ulang
            docker-compose rm -f api  || true
            # Tunggu sebentar agar proses stop/hapus selesai
            sleep 3
          '''
        }
      }
    }
    stage('Deploy') {
      steps {
        // 1) Update kode backend: tarik perubahan terbaru dari GitHub
        dir("${DEPLOY_DIR}/his-api") {
          sh 'git pull origin main'
        }
        // 2) Relaunch container: jalankan ulang service API dengan Docker Compose
        dir("${DEPLOY_DIR}") {
          sh 'docker-compose up -d --force-recreate api'
        }
      }
    }
  }
  post {
    success {
      // Pesan ketika deploy berhasil
      echo "✅ Deploy sukses!"
    }
    failure {
      // Pesan ketika deploy gagal
      echo "❌ Deploy gagal, cek log untuk detail."
    }
  }
}


//test