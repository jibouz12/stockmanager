import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { TranslationService, Language } from '@/services/TranslationService';

interface LanguageSelectorProps {
  onLanguageChange?: (language: Language) => void;
}

const languages = [
  { code: 'fr' as Language, name: 'Français', flag: 'Fr'' },
  { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
  { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
];

export default function LanguageSelector({ onLanguageChange }: LanguageSelectorProps) {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    TranslationService.getCurrentLanguage()
  );

  const getCurrentFlag = () => {
    const current = languages.find(lang => lang.code === currentLanguage);
    return current?.flag || '🇫🇷';
  };

  const handleLanguageSelect = async (language: Language) => {
    try {
      await TranslationService.setLanguage(language);
      setCurrentLanguage(language);
      setModalVisible(false);
      onLanguageChange?.(language);
    } catch (error) {
      console.error('Erreur lors du changement de langue:', error);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.flagButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.flagText}>{getCurrentFlag()}</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.languageMenu}>
              {languages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageOption,
                    currentLanguage === language.code && styles.selectedLanguage
                  ]}
                  onPress={() => handleLanguageSelect(language.code)}
                >
                  <Text style={styles.languageFlag}>{language.flag}</Text>
                  <Text style={[
                    styles.languageName,
                    currentLanguage === language.code && styles.selectedLanguageName
                  ]}>
                    {language.name}
                  </Text>
                  {currentLanguage === language.code && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  flagButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  flagText: {
    fontSize: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    margin: 20,
  },
  languageMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedLanguage: {
    backgroundColor: '#EBF8FF',
  },
  languageFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  selectedLanguageName: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
});