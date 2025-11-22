pluginManagement {
    includeBuild("../node_modules/@react-native/gradle-plugin")
}

plugins {
    id("com.facebook.react.settings")
}

plugins.withId("com.facebook.react.settings") {
    extensions.findByName("react")?.let { extension ->
        extension.javaClass.getMethod("autolinkLibrariesFromCommand").invoke(extension)
    }
}

rootProject.name = "FakturaVakt"
include(":app")
includeBuild("../node_modules/@react-native/gradle-plugin")
