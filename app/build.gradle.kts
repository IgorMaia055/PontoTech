plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.pontotech_cyber.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.pontotech_cyber.app"
        minSdk = 24
        targetSdk = 34
        versionCode = 8
        versionName = "2.2"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    signingConfigs {
        create("release") {
            keyAlias = "upload"
            keyPassword = "cyber430655"
            storeFile = file("E:\\my-pc\\ProjectAndroid\\v.2\\PontoTech\\pontotech-key.jks")
            storePassword = "cyber430655"
        }
    }

    buildTypes {
        getByName("release") {
            signingConfig = signingConfigs.getByName("release")
            isMinifyEnabled = false
            isDebuggable = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }

    kotlinOptions {
        jvmTarget = "1.8"
    }

    buildFeatures {
        viewBinding = true
    }
    buildToolsVersion = "34.0.0"
}

dependencies {
    implementation("androidx.core:core-ktx:1.7.0")
    implementation("androidx.appcompat:appcompat:1.4.0")
    implementation("androidx.work:work-runtime-ktx:2.7.1")
    implementation("androidx.sqlite:sqlite:2.1.0")
    implementation("androidx.core:core-ktx:1.7.0")
    implementation("androidx.appcompat:appcompat:1.4.0")
    implementation("com.google.android.material:material:1.5.0") // Ou uma versão mais recente
    implementation("androidx.activity:activity-ktx:1.4.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.2")
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.3")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.4.0")
}