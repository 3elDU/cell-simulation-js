<script setup lang="ts">
import useLanguage from "@/composables/language";
import {
  languageNames,
  supportedLanguages,
  type SupportedLanguageCode,
} from "@/i18n";

const { language: selectedLanguage, setLanguage } = useLanguage();
</script>

<template>
  <FooterButton element="div">
    <IconMdiGlobe />
    <select
      id="language-select"
      tabindex="0"
      @input="
        setLanguage(
          ($event.target as HTMLSelectElement).value as SupportedLanguageCode
        )
      "
    >
      <option
        v-for="language in supportedLanguages"
        :value="language"
        :selected="language === selectedLanguage"
      >
        {{ languageNames[language] }}
      </option>
    </select>
  </FooterButton>
</template>

<style scoped>
.footer-button {
  position: relative;
}

#language-select {
  position: absolute;
  inset: 0;
  opacity: 0;
}
</style>
