import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../core/translation.service';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.sass',
})
export class FooterComponent {
  private translationService = inject(TranslationService);

  isArabic = computed(() => this.translationService.isArabic());

  // Translations
  about = computed(() => this.translationService.t('footer.about'));
  quickLinks = computed(() => this.translationService.t('footer.quickLinks'));
  legal = computed(() => this.translationService.t('footer.legal'));
  contact = computed(() => this.translationService.t('footer.contact'));
  followUs = computed(() => this.translationService.t('footer.followUs'));
  allRightsReserved = computed(() => this.translationService.t('footer.allRightsReserved'));
  
  // Menu translations
  home = computed(() => this.translationService.t('navbar.home'));
  joinUs = computed(() => this.translationService.t('navbar.joinUs'));
  customerService = computed(() => this.translationService.t('navbar.customerService'));
  auctions = computed(() => this.translationService.t('navbar.auctions'));
  sellProduct = computed(() => this.translationService.t('navbar.sellProduct'));
  privacyPolicy = computed(() => this.translationService.t('menu.privacyPolicy'));
  returnPolicy = computed(() => this.translationService.t('menu.returnPolicy'));
  sitePolicy = computed(() => this.translationService.t('menu.sitePolicy'));
  copyright = computed(() => this.translationService.t('menu.copyright'));
  
  // Modal content
  privacyPolicyContent = computed(() => this.translationService.t('menu.privacyPolicyContent'));
  returnPolicyContent = computed(() => this.translationService.t('menu.returnPolicyContent'));
  sitePolicyContent = computed(() => this.translationService.t('menu.sitePolicyContent'));
  copyrightContent = computed(() => this.translationService.t('menu.copyrightContent'));
  close = computed(() => this.translationService.t('menu.close'));
  
  // Modal states
  privacyPolicyModalOpen = signal(false);
  returnPolicyModalOpen = signal(false);
  sitePolicyModalOpen = signal(false);
  copyrightModalOpen = signal(false);

  onPrivacyPolicy() {
    this.privacyPolicyModalOpen.set(true);
  }

  onReturnPolicy() {
    this.returnPolicyModalOpen.set(true);
  }

  onSitePolicy() {
    this.sitePolicyModalOpen.set(true);
  }

  onCopyright() {
    this.copyrightModalOpen.set(true);
  }

  closePrivacyPolicyModal() {
    this.privacyPolicyModalOpen.set(false);
  }

  closeReturnPolicyModal() {
    this.returnPolicyModalOpen.set(false);
  }

  closeSitePolicyModal() {
    this.sitePolicyModalOpen.set(false);
  }

  closeCopyrightModal() {
    this.copyrightModalOpen.set(false);
  }
}

