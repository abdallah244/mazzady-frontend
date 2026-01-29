import { Component, signal, inject, computed, input, output, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslationService } from '../../core/translation.service';
import { AuthService } from '../../auth/auth.service';
import { ThemeService, ColorScheme } from '../../core/theme.service';

type ChatStep =
  | 'menu'
  | 'login'
  | 'register'
  | 'theme'
  | 'about'
  | 'home'
  | 'admin'
  | 'adminUsersManagement'
  | 'adminEditHomePage'
  | 'adminMoneyRequests'
  | 'adminCustomerFeedback'
  | 'adminJobApplications'
  | 'adminAuctionProducts'
  | 'adminSendMessages'
  | 'adminAuctionsManagement'
  | 'confirmLanguage'
  | 'confirmTheme'
  | 'privacyPolicy'
  | 'returnPolicy'
  | 'sitePolicy'
  | 'copyright'
  | 'quickReference'
  | 'deposit'
  | 'messages'
  | 'cart'
  | 'profile'
  | 'customerService'
  | 'joinUs'
  | 'sellProduct'
  | 'auctions'
  | 'adminAddProducts'
  | 'adminThemeSelection'
  | 'adminModeSelection';

interface ChatMessage {
  type: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  imports: [CommonModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.sass',
})
export class ChatbotComponent implements OnInit {
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);

  isOpen = input.required<boolean>();
  isAdminMode = input<boolean>(false);
  close = output<void>();
  currentStep = signal<ChatStep>('menu');
  messages = signal<ChatMessage[]>([]);
  isDragging = signal(false);
  dragOffset = signal({ x: 0, y: 0 });
  position = signal({ x: 0, y: 0 });
  buttonsMenuOpen = signal(false);
  pendingAction = signal<'language' | 'theme' | null>(null);
  isClosing = signal(false);

  // Computed styles for container position
  containerLeft = computed(() => {
    if (this.translationService.isArabic()) {
      return undefined;
    }
    return this.position().x || undefined;
  });

  containerRight = computed(() => {
    if (this.translationService.isArabic()) {
      // If position is set, calculate right position
      if (this.position().x) {
        const containerWidth = 400;
        return window.innerWidth - this.position().x - containerWidth;
      }
      return 20; // Default right position
    }
    // For English, only show right if position is not set
    return !this.position().x && !this.position().y ? 20 : undefined;
  });

  containerTop = computed(() => {
    return this.position().y || undefined;
  });

  containerBottom = computed(() => {
    return !this.position().y ? 100 : undefined;
  });

  // Translations
  welcomeMessage = computed(() => this.translationService.t('chatbot.welcome'));
  loginButton = computed(() => this.translationService.t('chatbot.login'));
  registerButton = computed(() => this.translationService.t('chatbot.register'));
  backToMenu = computed(() => this.translationService.t('chatbot.backToMenu'));
  loginStep1 = computed(() => this.translationService.t('chatbot.loginStep1'));
  loginStep2 = computed(() => this.translationService.t('chatbot.loginStep2'));
  loginStep3 = computed(() => this.translationService.t('chatbot.loginStep3'));
  loginStep4 = computed(() => this.translationService.t('chatbot.loginStep4'));
  loginStep5 = computed(() => this.translationService.t('chatbot.loginStep5'));
  goToLogin = computed(() => this.translationService.t('chatbot.goToLogin'));
  registerStep1 = computed(() => this.translationService.t('chatbot.registerStep1'));
  registerStep2 = computed(() => this.translationService.t('chatbot.registerStep2'));
  registerStep3 = computed(() => this.translationService.t('chatbot.registerStep3'));
  registerStep4 = computed(() => this.translationService.t('chatbot.registerStep4'));
  registerStep5 = computed(() => this.translationService.t('chatbot.registerStep5'));
  registerStep6 = computed(() => this.translationService.t('chatbot.registerStep6'));
  registerStep7 = computed(() => this.translationService.t('chatbot.registerStep7'));
  goToRegister = computed(() => this.translationService.t('chatbot.goToRegister'));
  alreadyRegistered = computed(() => this.translationService.t('chatbot.alreadyRegistered'));
  themeButton = computed(() => this.translationService.t('chatbot.theme'));
  themeExplanation1 = computed(() => this.translationService.t('chatbot.themeExplanation1'));
  themeExplanation2 = computed(() => this.translationService.t('chatbot.themeExplanation2'));
  themeExplanation3 = computed(() => this.translationService.t('chatbot.themeExplanation3'));
  themeExplanation4 = computed(() => this.translationService.t('chatbot.themeExplanation4'));
  themeExplanation5 = computed(() => this.translationService.t('chatbot.themeExplanation5'));
  goToTheme = computed(() => this.translationService.t('chatbot.goToTheme'));
  showOptions = computed(() => this.translationService.t('chatbot.showOptions'));
  hideOptions = computed(() => this.translationService.t('chatbot.hideOptions'));
  aboutButton = computed(() => this.translationService.t('chatbot.about'));
  aboutExplanation1 = computed(() => this.translationService.t('chatbot.aboutExplanation1'));
  aboutExplanation2 = computed(() => this.translationService.t('chatbot.aboutExplanation2'));
  aboutExplanation3 = computed(() => this.translationService.t('chatbot.aboutExplanation3'));
  aboutExplanation4 = computed(() => this.translationService.t('chatbot.aboutExplanation4'));
  aboutExplanation5 = computed(() => this.translationService.t('chatbot.aboutExplanation5'));
  homeButton = computed(() => this.translationService.t('chatbot.home'));
  homeExplanation1 = computed(() => this.translationService.t('chatbot.homeExplanation1'));
  homeExplanation2 = computed(() => this.translationService.t('chatbot.homeExplanation2'));
  homeExplanation3 = computed(() => this.translationService.t('chatbot.homeExplanation3'));
  homeExplanation4 = computed(() => this.translationService.t('chatbot.homeExplanation4'));
  privacyPolicyButton = computed(() => this.translationService.t('menu.privacyPolicy'));
  privacyPolicyContent = computed(() => this.translationService.t('menu.privacyPolicyContent'));
  returnPolicyButton = computed(() => this.translationService.t('menu.returnPolicy'));
  returnPolicyContent = computed(() => this.translationService.t('menu.returnPolicyContent'));
  sitePolicyButton = computed(() => this.translationService.t('menu.sitePolicy'));
  sitePolicyContent = computed(() => this.translationService.t('menu.sitePolicyContent'));
  copyrightButton = computed(() => this.translationService.t('menu.copyright'));
  copyrightContent = computed(() => this.translationService.t('menu.copyrightContent'));
  quickReferenceButton = computed(() => this.translationService.t('menu.quickReference'));
  quickReferenceContent = computed(() => this.translationService.t('menu.quickReferenceContent'));
  adminButton = computed(() => this.translationService.t('chatbot.admin'));
  adminExplanation1 = computed(() => this.translationService.t('chatbot.adminExplanation1'));
  adminExplanation2 = computed(() => this.translationService.t('chatbot.adminExplanation2'));
  adminExplanation3 = computed(() => this.translationService.t('chatbot.adminExplanation3'));
  adminExplanation4 = computed(() => this.translationService.t('chatbot.adminExplanation4'));
  adminChangeLanguage = computed(() => this.translationService.t('chatbot.adminChangeLanguage'));
  adminChangeLanguageQuestion = computed(() =>
    this.translationService.t('chatbot.adminChangeLanguageQuestion'),
  );
  adminChangeTheme = computed(() => this.translationService.t('chatbot.adminChangeTheme'));
  adminChangeThemeQuestion = computed(() =>
    this.translationService.t('chatbot.adminChangeThemeQuestion'),
  );
  adminUsersManagement = computed(() => this.translationService.t('chatbot.adminUsersManagement'));
  adminUsersManagementExplanation1 = computed(() =>
    this.translationService.t('chatbot.adminUsersManagementExplanation1'),
  );
  adminUsersManagementExplanation2 = computed(() =>
    this.translationService.t('chatbot.adminUsersManagementExplanation2'),
  );
  adminUsersManagementExplanation3 = computed(() =>
    this.translationService.t('chatbot.adminUsersManagementExplanation3'),
  );
  adminUsersManagementExplanation4 = computed(() =>
    this.translationService.t('chatbot.adminUsersManagementExplanation4'),
  );
  adminEditHomePage = computed(() => this.translationService.t('chatbot.adminEditHomePage'));
  adminEditHomePageExplanation1 = computed(() =>
    this.translationService.t('chatbot.adminEditHomePageExplanation1'),
  );
  adminEditHomePageExplanation2 = computed(() =>
    this.translationService.t('chatbot.adminEditHomePageExplanation2'),
  );
  adminEditHomePageExplanation3 = computed(() =>
    this.translationService.t('chatbot.adminEditHomePageExplanation3'),
  );
  adminEditHomePageExplanation4 = computed(() =>
    this.translationService.t('chatbot.adminEditHomePageExplanation4'),
  );
  adminMoneyRequests = computed(() => this.translationService.t('chatbot.adminMoneyRequests'));
  adminMoneyRequestsExplanation1 = computed(() =>
    this.translationService.t('chatbot.adminMoneyRequestsExplanation1'),
  );
  adminMoneyRequestsExplanation2 = computed(() =>
    this.translationService.t('chatbot.adminMoneyRequestsExplanation2'),
  );
  adminMoneyRequestsExplanation3 = computed(() =>
    this.translationService.t('chatbot.adminMoneyRequestsExplanation3'),
  );
  adminMoneyRequestsExplanation4 = computed(() =>
    this.translationService.t('chatbot.adminMoneyRequestsExplanation4'),
  );
  depositButton = computed(() => this.translationService.t('chatbot.deposit'));
  depositExplanation1 = computed(() => this.translationService.t('chatbot.depositExplanation1'));
  depositExplanation2 = computed(() => this.translationService.t('chatbot.depositExplanation2'));
  depositExplanation3 = computed(() => this.translationService.t('chatbot.depositExplanation3'));
  depositExplanation4 = computed(() => this.translationService.t('chatbot.depositExplanation4'));
  messagesButton = computed(() => this.translationService.t('chatbot.messages'));
  messagesExplanation1 = computed(() => this.translationService.t('chatbot.messagesExplanation1'));
  messagesExplanation2 = computed(() => this.translationService.t('chatbot.messagesExplanation2'));
  messagesExplanation3 = computed(() => this.translationService.t('chatbot.messagesExplanation3'));
  messagesExplanation4 = computed(() => this.translationService.t('chatbot.messagesExplanation4'));
  cartButton = computed(() => this.translationService.t('chatbot.cart'));
  cartExplanation1 = computed(() => this.translationService.t('chatbot.cartExplanation1'));
  cartExplanation2 = computed(() => this.translationService.t('chatbot.cartExplanation2'));
  cartExplanation3 = computed(() => this.translationService.t('chatbot.cartExplanation3'));
  cartExplanation4 = computed(() => this.translationService.t('chatbot.cartExplanation4'));
  cartExplanation5 = computed(() => this.translationService.t('chatbot.cartExplanation5'));
  goToCart = computed(() => this.translationService.t('chatbot.goToCart'));
  profileButton = computed(() => this.translationService.t('chatbot.profile'));
  profileExplanation1 = computed(() => this.translationService.t('chatbot.profileExplanation1'));
  profileExplanation2 = computed(() => this.translationService.t('chatbot.profileExplanation2'));
  profileExplanation3 = computed(() => this.translationService.t('chatbot.profileExplanation3'));
  profileExplanation4 = computed(() => this.translationService.t('chatbot.profileExplanation4'));
  profileExplanation5 = computed(() => this.translationService.t('chatbot.profileExplanation5'));
  goToProfile = computed(() => this.translationService.t('chatbot.goToProfile'));
  adminCustomerFeedback = computed(() =>
    this.translationService.t('chatbot.adminCustomerFeedback'),
  );
  adminCustomerFeedbackExplanation1 = computed(() =>
    this.translationService.t('chatbot.adminCustomerFeedbackExplanation1'),
  );
  adminCustomerFeedbackExplanation2 = computed(() =>
    this.translationService.t('chatbot.adminCustomerFeedbackExplanation2'),
  );
  adminCustomerFeedbackExplanation3 = computed(() =>
    this.translationService.t('chatbot.adminCustomerFeedbackExplanation3'),
  );
  adminCustomerFeedbackExplanation4 = computed(() =>
    this.translationService.t('chatbot.adminCustomerFeedbackExplanation4'),
  );
  goToCustomerFeedback = computed(() => this.translationService.t('chatbot.goToCustomerFeedback'));
  customerServiceButton = computed(() => this.translationService.t('chatbot.customerService'));
  customerServiceExplanation1 = computed(() =>
    this.translationService.t('chatbot.customerServiceExplanation1'),
  );
  customerServiceExplanation2 = computed(() =>
    this.translationService.t('chatbot.customerServiceExplanation2'),
  );
  customerServiceExplanation3 = computed(() =>
    this.translationService.t('chatbot.customerServiceExplanation3'),
  );
  customerServiceExplanation4 = computed(() =>
    this.translationService.t('chatbot.customerServiceExplanation4'),
  );
  goToCustomerService = computed(() => this.translationService.t('chatbot.goToCustomerService'));
  joinUsButton = computed(() => this.translationService.t('chatbot.joinUs'));
  joinUsExplanation1 = computed(() => this.translationService.t('chatbot.joinUsExplanation1'));
  joinUsExplanation2 = computed(() => this.translationService.t('chatbot.joinUsExplanation2'));
  joinUsExplanation3 = computed(() => this.translationService.t('chatbot.joinUsExplanation3'));
  joinUsExplanation4 = computed(() => this.translationService.t('chatbot.joinUsExplanation4'));
  goToJoinUs = computed(() => this.translationService.t('chatbot.goToJoinUs'));
  adminJobApplications = computed(() => this.translationService.t('chatbot.adminJobApplications'));
  adminJobApplicationsExplanation1 = computed(() =>
    this.translationService.t('chatbot.adminJobApplicationsExplanation1'),
  );
  adminJobApplicationsExplanation2 = computed(() =>
    this.translationService.t('chatbot.adminJobApplicationsExplanation2'),
  );
  adminJobApplicationsExplanation3 = computed(() =>
    this.translationService.t('chatbot.adminJobApplicationsExplanation3'),
  );
  adminJobApplicationsExplanation4 = computed(() =>
    this.translationService.t('chatbot.adminJobApplicationsExplanation4'),
  );
  goToJobApplications = computed(() => this.translationService.t('chatbot.goToJobApplications'));
  sellProductButton = computed(() => this.translationService.t('chatbot.sellProduct'));
  sellProductExplanation1 = computed(() =>
    this.translationService.t('chatbot.sellProductExplanation1'),
  );
  sellProductExplanation2 = computed(() =>
    this.translationService.t('chatbot.sellProductExplanation2'),
  );
  sellProductExplanation3 = computed(() =>
    this.translationService.t('chatbot.sellProductExplanation3'),
  );
  sellProductExplanation4 = computed(() =>
    this.translationService.t('chatbot.sellProductExplanation4'),
  );
  goToSellProduct = computed(() => this.translationService.t('chatbot.goToSellProduct'));
  auctionsButton = computed(() => this.translationService.t('chatbot.auctions'));
  auctionsExplanation1 = computed(() => this.translationService.t('chatbot.auctionsExplanation1'));
  auctionsExplanation2 = computed(() => this.translationService.t('chatbot.auctionsExplanation2'));
  auctionsExplanation3 = computed(() => this.translationService.t('chatbot.auctionsExplanation3'));
  auctionsExplanation4 = computed(() => this.translationService.t('chatbot.auctionsExplanation4'));
  auctionsExplanation5 = computed(() => this.translationService.t('chatbot.auctionsExplanation5'));
  goToAuctions = computed(() => this.translationService.t('chatbot.goToAuctions'));
  adminAuctionProducts = computed(() => this.translationService.t('chatbot.adminAuctionProducts'));
  adminAuctionProductsExplanation1 = computed(() =>
    this.translationService.t('chatbot.adminAuctionProductsExplanation1'),
  );
  adminAuctionProductsExplanation2 = computed(() =>
    this.translationService.t('chatbot.adminAuctionProductsExplanation2'),
  );
  adminAuctionProductsExplanation3 = computed(() =>
    this.translationService.t('chatbot.adminAuctionProductsExplanation3'),
  );
  adminAuctionProductsExplanation4 = computed(() =>
    this.translationService.t('chatbot.adminAuctionProductsExplanation4'),
  );
  goToAuctionProducts = computed(() => this.translationService.t('chatbot.goToAuctionProducts'));
  adminSendMessages = computed(() => this.translationService.t('chatbot.adminSendMessages'));
  adminSendMessagesExplanation1 = computed(() =>
    this.translationService.t('chatbot.adminSendMessagesExplanation1'),
  );
  adminSendMessagesExplanation2 = computed(() =>
    this.translationService.t('chatbot.adminSendMessagesExplanation2'),
  );
  adminSendMessagesExplanation3 = computed(() =>
    this.translationService.t('chatbot.adminSendMessagesExplanation3'),
  );
  adminSendMessagesExplanation4 = computed(() =>
    this.translationService.t('chatbot.adminSendMessagesExplanation4'),
  );
  goToSendMessages = computed(() => this.translationService.t('chatbot.goToSendMessages'));
  adminAddProducts = computed(() => this.translationService.t('chatbot.adminAddProducts'));
  adminAddProductsExplanation1 = computed(() =>
    this.translationService.t('chatbot.adminAddProductsExplanation1'),
  );
  adminAddProductsExplanation2 = computed(() =>
    this.translationService.t('chatbot.adminAddProductsExplanation2'),
  );
  adminAddProductsExplanation3 = computed(() =>
    this.translationService.t('chatbot.adminAddProductsExplanation3'),
  );
  adminAddProductsExplanation4 = computed(() =>
    this.translationService.t('chatbot.adminAddProductsExplanation4'),
  );
  goToAddProducts = computed(() => this.translationService.t('chatbot.goToAddProducts'));
  adminAuctionsManagement = computed(() =>
    this.translationService.t('chatbot.adminAuctionsManagement'),
  );
  adminAuctionsManagementExplanation1 = computed(() =>
    this.translationService.t('chatbot.adminAuctionsManagementExplanation1'),
  );
  adminAuctionsManagementExplanation2 = computed(() =>
    this.translationService.t('chatbot.adminAuctionsManagementExplanation2'),
  );
  adminAuctionsManagementExplanation3 = computed(() =>
    this.translationService.t('chatbot.adminAuctionsManagementExplanation3'),
  );
  adminAuctionsManagementExplanation4 = computed(() =>
    this.translationService.t('chatbot.adminAuctionsManagementExplanation4'),
  );
  goToAuctionsManagement = computed(() =>
    this.translationService.t('chatbot.goToAuctionsManagement'),
  );
  yesButton = computed(() => this.translationService.t('chatbot.yes'));
  noButton = computed(() => this.translationService.t('chatbot.no'));

  // Theme Names
  themeDefault = computed(() => this.translationService.t('menu.schemeDefault'));
  themeBasic = computed(() => this.translationService.t('menu.schemeBasic'));

  // Mode Names
  modeLight = computed(() => this.translationService.t('menu.themeLight'));
  modeDark = computed(() => this.translationService.t('menu.themeDark'));
  changeModeLabel = computed(() => this.translationService.t('menu.changeTheme')); // "Change Theme" usually means L/D in this app
  changeSchemeLabel = computed(() => this.translationService.t('menu.changeScheme'));

  isArabic = computed(() => this.translationService.isArabic());

  ngOnInit() {
    if (this.isOpen()) {
      if (this.isAdminMode()) {
        // Admin mode: show only admin button
        this.currentStep.set('menu');
        this.messages.set([]);
        setTimeout(() => {
          this.addBotMessage(
            this.isArabic()
              ? 'مرحباً! أنا مساعد Mazzady للأدمن. كيف يمكنني مساعدتك؟'
              : "Hello! I'm Mazzady Admin Assistant. How can I help you?",
          );
        }, 300);
      } else {
        // Normal mode: show normal menu
        this.currentStep.set('menu');
        this.messages.set([]);
        setTimeout(() => {
          this.addBotMessage(this.welcomeMessage());
        }, 300);
      }
    }
  }

  checkIfUserIsAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  closeChat() {
    // Add closing animation
    this.isClosing.set(true);

    // Wait for animation to complete before closing
    setTimeout(() => {
      this.close.emit();
      this.currentStep.set('menu');
      this.messages.set([]);
      this.buttonsMenuOpen.set(false);
      this.isClosing.set(false);
    }, 300); // Match animation duration
  }

  addBotMessage(text: string) {
    this.messages.update((msgs) => [
      ...msgs,
      {
        type: 'bot',
        text,
        timestamp: new Date(),
      },
    ]);
  }

  addUserMessage(text: string) {
    this.messages.update((msgs) => [
      ...msgs,
      {
        type: 'user',
        text,
        timestamp: new Date(),
      },
    ]);
  }

  onLoginClick() {
    this.closeButtonsMenu();
    // Check if user is already authenticated
    if (this.checkIfUserIsAuthenticated()) {
      this.addUserMessage(this.loginButton());
      setTimeout(() => {
        this.addBotMessage(this.alreadyRegistered());
      }, 500);
      return;
    }

    this.addUserMessage(this.loginButton());
    this.currentStep.set('login');

    // Add login steps messages
    setTimeout(() => {
      this.addBotMessage(this.loginStep1());
    }, 500);

    setTimeout(() => {
      this.addBotMessage(this.loginStep2());
    }, 1000);

    setTimeout(() => {
      this.addBotMessage(this.loginStep3());
    }, 1500);

    setTimeout(() => {
      this.addBotMessage(this.loginStep4());
    }, 2000);

    setTimeout(() => {
      this.addBotMessage(this.loginStep5());
    }, 2500);

    setTimeout(() => {
      this.addBotMessage(this.goToLogin());
    }, 3000);
  }

  onRegisterClick() {
    this.closeButtonsMenu();
    // Check if user is already authenticated
    if (this.checkIfUserIsAuthenticated()) {
      this.addUserMessage(this.registerButton());
      setTimeout(() => {
        this.addBotMessage(this.alreadyRegistered());
      }, 500);
      return;
    }

    this.addUserMessage(this.registerButton());
    this.currentStep.set('register');

    // Add registration steps messages
    setTimeout(() => {
      this.addBotMessage(this.registerStep1());
    }, 500);

    setTimeout(() => {
      this.addBotMessage(this.registerStep2());
    }, 1000);

    setTimeout(() => {
      this.addBotMessage(this.registerStep3());
    }, 1500);

    setTimeout(() => {
      this.addBotMessage(this.registerStep4());
    }, 2000);

    setTimeout(() => {
      this.addBotMessage(this.registerStep5());
    }, 2500);

    setTimeout(() => {
      this.addBotMessage(this.registerStep6());
    }, 3000);

    setTimeout(() => {
      this.addBotMessage(this.registerStep7());
    }, 3500);

    setTimeout(() => {
      this.addBotMessage(this.goToRegister());
    }, 4000);
  }

  onBackToMenu() {
    this.addUserMessage(this.backToMenu());
    this.currentStep.set('menu');
    this.buttonsMenuOpen.set(false);
    setTimeout(() => {
      this.messages.set([]);
      setTimeout(() => {
        if (this.isAdminMode()) {
          this.addBotMessage(
            this.isArabic()
              ? 'مرحباً! أنا مساعد Mazzady للأدمن. كيف يمكنني مساعدتك؟'
              : "Hello! I'm Mazzady Admin Assistant. How can I help you?",
          );
        } else {
          this.addBotMessage(this.welcomeMessage());
        }
      }, 300);
    }, 500);
  }

  toggleButtonsMenu() {
    this.buttonsMenuOpen.update((open) => !open);
  }

  closeButtonsMenu() {
    this.buttonsMenuOpen.set(false);
  }

  onGoToLoginPage() {
    this.closeButtonsMenu();
    this.closeChat();
    this.router.navigate(['/login']);
  }

  onGoToRegisterPage() {
    this.closeButtonsMenu();
    this.closeChat();
    this.router.navigate(['/register']);
  }

  onThemeClick() {
    this.closeButtonsMenu();
    this.addUserMessage(this.themeButton());
    this.currentStep.set('theme');

    // Add theme explanation messages
    setTimeout(() => {
      this.addBotMessage(this.themeExplanation1());
    }, 500);

    setTimeout(() => {
      this.addBotMessage(this.themeExplanation2());
    }, 1500);

    setTimeout(() => {
      this.addBotMessage(this.themeExplanation3());
    }, 2500);

    setTimeout(() => {
      this.addBotMessage(this.themeExplanation4());
    }, 3500);

    setTimeout(() => {
      this.addBotMessage(this.themeExplanation5());
    }, 4500);

    setTimeout(() => {
      this.addBotMessage(this.goToTheme());
    }, 5500);
  }

  onGoToThemeMenu() {
    this.closeButtonsMenu();
    this.closeChat();
    // The theme button is in the floating menu, so we just close the chat
    // The user can access it from the floating menu button
  }

  onAboutClick() {
    this.closeButtonsMenu();
    this.addUserMessage(this.aboutButton());
    this.currentStep.set('about');

    // Add about explanation messages
    setTimeout(() => {
      this.addBotMessage(this.aboutExplanation1());
    }, 500);

    setTimeout(() => {
      this.addBotMessage(this.aboutExplanation2());
    }, 1500);

    setTimeout(() => {
      this.addBotMessage(this.aboutExplanation3());
    }, 3000);

    setTimeout(() => {
      this.addBotMessage(this.aboutExplanation4());
    }, 4500);

    setTimeout(() => {
      this.addBotMessage(this.aboutExplanation5());
    }, 6000);
  }

  onHomeClick() {
    this.closeButtonsMenu();
    this.addUserMessage(this.homeButton());
    this.currentStep.set('home');

    // Add home explanation messages
    setTimeout(() => {
      this.addBotMessage(this.homeExplanation1());
    }, 500);

    setTimeout(() => {
      this.addBotMessage(this.homeExplanation2());
    }, 2000);

    setTimeout(() => {
      this.addBotMessage(this.homeExplanation3());
    }, 3500);

    setTimeout(() => {
      this.addBotMessage(this.homeExplanation4());
    }, 5000);
  }

  onPrivacyPolicyClick() {
    this.closeButtonsMenu();
    this.addUserMessage(this.privacyPolicyButton());
    this.currentStep.set('privacyPolicy');

    // Split content by newlines and add each line as a separate message
    const content = this.privacyPolicyContent();
    const lines = content.split('\n').filter((line) => line.trim());

    lines.forEach((line, index) => {
      setTimeout(
        () => {
          this.addBotMessage(line.trim());
        },
        500 + index * 800,
      );
    });
  }

  onReturnPolicyClick() {
    this.closeButtonsMenu();
    this.addUserMessage(this.returnPolicyButton());
    this.currentStep.set('returnPolicy');

    const content = this.returnPolicyContent();
    const lines = content.split('\n').filter((line) => line.trim());

    lines.forEach((line, index) => {
      setTimeout(
        () => {
          this.addBotMessage(line.trim());
        },
        500 + index * 800,
      );
    });
  }

  onSitePolicyClick() {
    this.closeButtonsMenu();
    this.addUserMessage(this.sitePolicyButton());
    this.currentStep.set('sitePolicy');

    const content = this.sitePolicyContent();
    const lines = content.split('\n').filter((line) => line.trim());

    lines.forEach((line, index) => {
      setTimeout(
        () => {
          this.addBotMessage(line.trim());
        },
        500 + index * 800,
      );
    });
  }

  onCopyrightClick() {
    this.closeButtonsMenu();
    this.addUserMessage(this.copyrightButton());
    this.currentStep.set('copyright');

    const content = this.copyrightContent();
    const lines = content.split('\n').filter((line) => line.trim());

    lines.forEach((line, index) => {
      setTimeout(
        () => {
          this.addBotMessage(line.trim());
        },
        500 + index * 800,
      );
    });
  }

  onQuickReferenceClick() {
    this.closeButtonsMenu();
    this.addUserMessage(this.quickReferenceButton());
    this.currentStep.set('quickReference');

    const content = this.quickReferenceContent();
    const lines = content.split('\n').filter((line) => line.trim());

    lines.forEach((line, index) => {
      setTimeout(
        () => {
          this.addBotMessage(line.trim());
        },
        500 + index * 800,
      );
    });
  }

  onAdminClick() {
    this.closeButtonsMenu();
    this.addUserMessage(this.adminButton());
    this.currentStep.set('admin');

    // Add admin explanation messages
    setTimeout(() => {
      this.addBotMessage(this.adminExplanation1());
    }, 500);

    setTimeout(() => {
      this.addBotMessage(this.adminExplanation2());
    }, 2000);

    setTimeout(() => {
      this.addBotMessage(this.adminExplanation3());
    }, 3500);

    setTimeout(() => {
      this.addBotMessage(this.adminExplanation4());
    }, 5000);
  }

  onAdminChangeLanguageClick() {
    this.closeButtonsMenu();
    this.addUserMessage(this.adminChangeLanguage());
    this.pendingAction.set('language');
    this.currentStep.set('confirmLanguage');

    setTimeout(() => {
      this.addBotMessage(this.adminChangeLanguageQuestion());
    }, 500);
  }

  onAdminChangeThemeClick() {
    this.closeButtonsMenu();
    this.addUserMessage(this.adminChangeTheme());
    this.pendingAction.set('theme');
    this.currentStep.set('confirmTheme');

    setTimeout(() => {
      this.addBotMessage(this.adminChangeThemeQuestion());
    }, 500);
  }

  onAdminThemeSelectionClick() {
    this.closeButtonsMenu();
    this.addUserMessage(this.adminChangeTheme());
    this.currentStep.set('adminThemeSelection');

    setTimeout(() => {
      this.addBotMessage(this.isArabic() ? 'يرجى اختيار الثيم المناسب:' : 'Please select a theme:');
    }, 500);
  }

  onAdminSelectTheme(theme: string) {
    this.themeService.setScheme(theme as ColorScheme);
    this.addUserMessage(this.getThemeName(theme));

    setTimeout(() => {
      this.addBotMessage(
        this.isArabic() ? 'تم تغيير نمط الألوان بنجاح!' : 'Color scheme changed successfully!',
      );
    }, 500);

    this.returnToMenuAfterDelay();
  }

  onAdminModeSelectionClick() {
    this.closeButtonsMenu();
    this.addUserMessage(this.changeModeLabel());
    this.currentStep.set('adminModeSelection');

    setTimeout(() => {
      this.addBotMessage(this.isArabic() ? 'يرجى اختيار الوضع:' : 'Please select a mode:');
    }, 500);
  }

  onAdminSelectMode(mode: 'light' | 'dark') {
    this.themeService.setTheme(mode);
    this.addUserMessage(mode === 'light' ? this.modeLight() : this.modeDark());

    setTimeout(() => {
      this.addBotMessage(this.isArabic() ? 'تم تغيير الوضع بنجاح!' : 'Mode changed successfully!');
    }, 500);

    this.returnToMenuAfterDelay();
  }

  private returnToMenuAfterDelay() {
    setTimeout(() => {
      this.currentStep.set('menu');
      this.messages.set([]);
      setTimeout(() => {
        this.addBotMessage(
          this.isArabic()
            ? 'مرحباً! أنا مساعد Mazzady للأدمن. كيف يمكنني مساعدتك؟'
            : "Hello! I'm Mazzady Admin Assistant. How can I help you?",
        );
      }, 300);
    }, 2000);
  }

  private getThemeName(theme: string): string {
    switch (theme) {
      case 'default':
        return this.themeDefault();
      case 'basic':
        return this.themeBasic();
      default:
        return theme;
    }
  }

  onConfirmYes() {
    const action = this.pendingAction();
    if (action === 'language') {
      this.addUserMessage(this.yesButton());
      this.translationService.toggleLanguage();
      setTimeout(() => {
        this.addBotMessage(
          this.isArabic() ? 'تم تغيير اللغة بنجاح!' : 'Language changed successfully!',
        );
      }, 500);
    } else if (action === 'theme') {
      this.addUserMessage(this.yesButton());
      this.themeService.toggleTheme();
      setTimeout(() => {
        this.addBotMessage(
          this.isArabic() ? 'تم تغيير الثيم بنجاح!' : 'Theme changed successfully!',
        );
      }, 500);
    }
    this.pendingAction.set(null);
    setTimeout(() => {
      this.currentStep.set('menu');
      this.messages.set([]);
      setTimeout(() => {
        this.addBotMessage(
          this.isArabic()
            ? 'مرحباً! أنا مساعد Mazzady للأدمن. كيف يمكنني مساعدتك؟'
            : "Hello! I'm Mazzady Admin Assistant. How can I help you?",
        );
      }, 300);
    }, 2000);
  }

  onConfirmNo() {
    this.addUserMessage(this.noButton());
    setTimeout(() => {
      this.addBotMessage(this.isArabic() ? 'تم الإلغاء.' : 'Cancelled.');
    }, 500);
    this.pendingAction.set(null);
    setTimeout(() => {
      this.currentStep.set('menu');
      this.messages.set([]);
      setTimeout(() => {
        this.addBotMessage(
          this.isArabic()
            ? 'مرحباً! أنا مساعد Mazzady للأدمن. كيف يمكنني مساعدتك؟'
            : "Hello! I'm Mazzady Admin Assistant. How can I help you?",
        );
      }, 300);
    }, 2000);
  }

  onAdminUsersManagementClick() {
    this.closeButtonsMenu();
    this.addUserMessage(this.adminUsersManagement());
    this.currentStep.set('adminUsersManagement');

    // Add users management explanation messages
    setTimeout(() => {
      this.addBotMessage(this.adminUsersManagementExplanation1());
    }, 500);

    setTimeout(() => {
      this.addBotMessage(this.adminUsersManagementExplanation2());
    }, 2000);

    setTimeout(() => {
      this.addBotMessage(this.adminUsersManagementExplanation3());
    }, 3500);

    setTimeout(() => {
      this.addBotMessage(this.adminUsersManagementExplanation4());
    }, 5000);
  }

  onAdminEditHomePageClick() {
    this.closeButtonsMenu();
    this.addUserMessage(this.adminEditHomePage());
    this.currentStep.set('adminEditHomePage');

    // Add edit home page explanation messages
    setTimeout(() => {
      this.addBotMessage(this.adminEditHomePageExplanation1());
    }, 500);

    setTimeout(() => {
      this.addBotMessage(this.adminEditHomePageExplanation2());
    }, 2000);

    setTimeout(() => {
      this.addBotMessage(this.adminEditHomePageExplanation3());
    }, 3500);

    setTimeout(() => {
      this.addBotMessage(this.adminEditHomePageExplanation4());
    }, 5000);
  }

  onAdminMoneyRequestsClick() {
    this.closeButtonsMenu();
    this.addUserMessage(this.adminMoneyRequests());
    this.currentStep.set('adminMoneyRequests');

    // Add money requests explanation messages
    setTimeout(() => {
      this.addBotMessage(this.adminMoneyRequestsExplanation1());
    }, 500);

    setTimeout(() => {
      this.addBotMessage(this.adminMoneyRequestsExplanation2());
    }, 2000);

    setTimeout(() => {
      this.addBotMessage(this.adminMoneyRequestsExplanation3());
    }, 3500);

    setTimeout(() => {
      this.addBotMessage(this.adminMoneyRequestsExplanation4());
    }, 5000);
  }

  onDepositClick() {
    this.closeButtonsMenu();
    // Check if user is authenticated
    if (!this.checkIfUserIsAuthenticated()) {
      this.addUserMessage(this.depositButton());
      setTimeout(() => {
        this.addBotMessage(
          this.isArabic()
            ? 'يجب تسجيل الدخول أولاً لإضافة رصيد. يمكنك استخدام زر "تسجيل الدخول" من القائمة.'
            : 'You must login first to add funds. You can use the "Login" button from the menu.',
        );
      }, 500);
      return;
    }

    this.addUserMessage(this.depositButton());
    this.currentStep.set('deposit');

    // Add deposit explanation messages
    setTimeout(() => {
      this.addBotMessage(this.depositExplanation1());
    }, 500);

    setTimeout(() => {
      this.addBotMessage(this.depositExplanation2());
    }, 2000);

    setTimeout(() => {
      this.addBotMessage(this.depositExplanation3());
    }, 3500);

    setTimeout(() => {
      this.addBotMessage(this.depositExplanation4());
    }, 5000);
  }

  onMessagesClick() {
    this.closeButtonsMenu();
    // Check if user is authenticated
    if (!this.checkIfUserIsAuthenticated()) {
      this.addUserMessage(this.messagesButton());
      setTimeout(() => {
        this.addBotMessage(
          this.isArabic()
            ? 'يجب تسجيل الدخول أولاً لعرض الرسائل. يمكنك استخدام زر "تسجيل الدخول" من القائمة.'
            : 'You must login first to view messages. You can use the "Login" button from the menu.',
        );
      }, 500);
      return;
    }

    this.addUserMessage(this.messagesButton());
    this.currentStep.set('messages');

    // Add messages explanation messages
    setTimeout(() => {
      this.addBotMessage(this.messagesExplanation1());
    }, 500);

    setTimeout(() => {
      this.addBotMessage(this.messagesExplanation2());
    }, 2000);

    setTimeout(() => {
      this.addBotMessage(this.messagesExplanation3());
    }, 3500);

    setTimeout(() => {
      this.addBotMessage(this.messagesExplanation4());
    }, 5000);
  }

  onCartClick() {
    this.closeButtonsMenu();
    // Check if user is authenticated
    if (!this.checkIfUserIsAuthenticated()) {
      this.addUserMessage(this.cartButton());
      setTimeout(() => {
        this.addBotMessage(
          this.isArabic()
            ? 'يجب تسجيل الدخول أولاً لعرض السلة. يمكنك استخدام زر "تسجيل الدخول" من القائمة.'
            : 'You must login first to view the cart. You can use the "Login" button from the menu.',
        );
      }, 500);
      return;
    }

    this.addUserMessage(this.cartButton());
    this.currentStep.set('cart');

    // Add cart explanation messages
    setTimeout(() => {
      this.addBotMessage(this.cartExplanation1());
    }, 500);

    setTimeout(() => {
      this.addBotMessage(this.cartExplanation2());
    }, 2000);

    setTimeout(() => {
      this.addBotMessage(this.cartExplanation3());
    }, 3500);

    setTimeout(() => {
      this.addBotMessage(this.cartExplanation4());
    }, 5000);

    setTimeout(() => {
      this.addBotMessage(this.cartExplanation5());
    }, 6500);
  }

  onProfileClick() {
    this.closeButtonsMenu();
    // Check if user is authenticated
    if (!this.checkIfUserIsAuthenticated()) {
      this.addUserMessage(this.profileButton());
      setTimeout(() => {
        this.addBotMessage(
          this.isArabic()
            ? 'يجب عليك تسجيل الدخول أولاً للوصول إلى صفحة البروفايل. يمكنك استخدام زر "تسجيل الدخول" من القائمة.'
            : 'You must login first to access your profile page. You can use the "Login" button from the menu.',
        );
      }, 500);
      return;
    }

    this.addUserMessage(this.profileButton());
    this.currentStep.set('profile');

    // Add profile explanation messages
    setTimeout(() => {
      this.addBotMessage(this.profileExplanation1());
    }, 500);

    setTimeout(() => {
      this.addBotMessage(this.profileExplanation2());
    }, 2000);

    setTimeout(() => {
      this.addBotMessage(this.profileExplanation3());
    }, 3500);

    setTimeout(() => {
      this.addBotMessage(this.profileExplanation4());
    }, 5000);

    setTimeout(() => {
      this.addBotMessage(this.profileExplanation5());
    }, 6500);
  }

  onGoToProfile() {
    this.router.navigate(['/profile']);
    this.closeChat();
  }

  onAdminCustomerFeedbackClick() {
    this.closeButtonsMenu();
    this.addUserMessage(this.adminCustomerFeedback());
    this.currentStep.set('adminCustomerFeedback');

    // Add customer feedback explanation messages
    setTimeout(() => {
      this.addBotMessage(this.adminCustomerFeedbackExplanation1());
    }, 500);

    setTimeout(() => {
      this.addBotMessage(this.adminCustomerFeedbackExplanation2());
    }, 2000);

    setTimeout(() => {
      this.addBotMessage(this.adminCustomerFeedbackExplanation3());
    }, 3500);

    setTimeout(() => {
      this.addBotMessage(this.adminCustomerFeedbackExplanation4());
    }, 5000);
  }

  onGoToCustomerFeedback() {
    this.router.navigate(['/admin/customer-feedback']);
    this.closeChat();
  }

  onCustomerServiceClick() {
    this.closeButtonsMenu();
    // Check if user is authenticated
    if (!this.checkIfUserIsAuthenticated()) {
      this.addUserMessage(this.customerServiceButton());
      setTimeout(() => {
        this.addBotMessage(
          this.isArabic()
            ? 'يجب تسجيل الدخول أولاً لإرسال رسالة لخدمة العملاء. يمكنك استخدام زر "تسجيل الدخول" من القائمة.'
            : 'You must login first to send a customer service message. You can use the "Login" button from the menu.',
        );
      }, 500);
      return;
    }

    this.addUserMessage(this.customerServiceButton());
    this.currentStep.set('customerService');

    // Add customer service explanation messages
    setTimeout(() => {
      this.addBotMessage(this.customerServiceExplanation1());
    }, 500);

    setTimeout(() => {
      this.addBotMessage(this.customerServiceExplanation2());
    }, 2000);

    setTimeout(() => {
      this.addBotMessage(this.customerServiceExplanation3());
    }, 3500);

    setTimeout(() => {
      this.addBotMessage(this.customerServiceExplanation4());
    }, 5000);
  }

  onGoToCustomerService() {
    this.router.navigate(['/customer-service']);
    this.closeChat();
  }

  onJoinUsClick() {
    this.closeButtonsMenu();
    this.addUserMessage(this.joinUsButton());
    this.currentStep.set('joinUs');

    setTimeout(() => {
      this.addBotMessage(this.joinUsExplanation1());
    }, 500);

    setTimeout(() => {
      this.addBotMessage(this.joinUsExplanation2());
    }, 2000);

    setTimeout(() => {
      this.addBotMessage(this.joinUsExplanation3());
    }, 3500);

    setTimeout(() => {
      this.addBotMessage(this.joinUsExplanation4());
    }, 5000);
  }

  onGoToJoinUs() {
    this.router.navigate(['/join-us']);
    this.closeChat();
  }

  onAdminJobApplicationsClick() {
    this.closeButtonsMenu();
    this.addUserMessage(this.adminJobApplications());
    this.currentStep.set('adminJobApplications');

    setTimeout(() => {
      this.addBotMessage(this.adminJobApplicationsExplanation1());
    }, 500);

    setTimeout(() => {
      this.addBotMessage(this.adminJobApplicationsExplanation2());
    }, 2000);

    setTimeout(() => {
      this.addBotMessage(this.adminJobApplicationsExplanation3());
    }, 3500);

    setTimeout(() => {
      this.addBotMessage(this.adminJobApplicationsExplanation4());
    }, 5000);
  }

  onGoToJobApplications() {
    this.router.navigate(['/admin/job-applications']);
    this.closeChat();
  }

  onSellProductClick() {
    this.closeButtonsMenu();
    if (!this.checkIfUserIsAuthenticated()) {
      this.addUserMessage(this.sellProductButton());
      setTimeout(() => {
        this.addBotMessage(
          this.isArabic()
            ? 'يجب تسجيل الدخول أولاً لعرض منتجك. يمكنك استخدام زر "تسجيل الدخول" من القائمة.'
            : 'You must login first to sell your product. You can use the "Login" button from the menu.',
        );
      }, 500);
      return;
    }

    this.addUserMessage(this.sellProductButton());
    this.currentStep.set('sellProduct');

    setTimeout(() => {
      this.addBotMessage(this.sellProductExplanation1());
    }, 500);

    setTimeout(() => {
      this.addBotMessage(this.sellProductExplanation2());
    }, 2000);

    setTimeout(() => {
      this.addBotMessage(this.sellProductExplanation3());
    }, 3500);

    setTimeout(() => {
      this.addBotMessage(this.sellProductExplanation4());
    }, 5000);
  }

  onGoToSellProduct() {
    this.router.navigate(['/sell-product']);
    this.closeChat();
  }

  onAuctionsClick() {
    this.closeButtonsMenu();
    this.addUserMessage(this.auctionsButton());
    this.currentStep.set('auctions');

    setTimeout(() => {
      this.addBotMessage(this.auctionsExplanation1());
    }, 500);

    setTimeout(() => {
      this.addBotMessage(this.auctionsExplanation2());
    }, 2000);

    setTimeout(() => {
      this.addBotMessage(this.auctionsExplanation3());
    }, 3500);

    setTimeout(() => {
      this.addBotMessage(this.auctionsExplanation4());
    }, 5000);

    setTimeout(() => {
      this.addBotMessage(this.auctionsExplanation5());
    }, 6500);
  }

  onGoToAuctions() {
    this.router.navigate(['/auctions']);
    this.closeChat();
  }

  onAdminAuctionProductsClick() {
    this.closeButtonsMenu();
    this.addUserMessage(this.adminAuctionProducts());
    this.currentStep.set('adminAuctionProducts');

    setTimeout(() => {
      this.addBotMessage(this.adminAuctionProductsExplanation1());
    }, 500);

    setTimeout(() => {
      this.addBotMessage(this.adminAuctionProductsExplanation2());
    }, 2000);

    setTimeout(() => {
      this.addBotMessage(this.adminAuctionProductsExplanation3());
    }, 3500);

    setTimeout(() => {
      this.addBotMessage(this.adminAuctionProductsExplanation4());
    }, 5000);
  }

  onGoToAuctionProducts() {
    this.router.navigate(['/admin/auction-products']);
    this.closeChat();
  }

  onAdminSendMessagesClick() {
    this.closeButtonsMenu();
    this.addUserMessage(this.adminSendMessages());
    this.currentStep.set('adminSendMessages');

    setTimeout(() => {
      this.addBotMessage(this.adminSendMessagesExplanation1());
    }, 500);

    setTimeout(() => {
      this.addBotMessage(this.adminSendMessagesExplanation2());
    }, 2000);

    setTimeout(() => {
      this.addBotMessage(this.adminSendMessagesExplanation3());
    }, 3500);

    setTimeout(() => {
      this.addBotMessage(this.adminSendMessagesExplanation4());
    }, 5000);
  }

  onGoToSendMessages() {
    this.router.navigate(['/admin/send-messages']);
    this.closeChat();
  }

  onGoToCart() {
    this.router.navigate(['/cart']);
    this.closeChat();
  }

  onAdminAddProductsClick() {
    this.closeButtonsMenu();
    this.addUserMessage(this.adminAddProducts());
    this.currentStep.set('adminAddProducts');

    setTimeout(() => {
      this.addBotMessage(this.adminAddProductsExplanation1());
    }, 500);

    setTimeout(() => {
      this.addBotMessage(this.adminAddProductsExplanation2());
    }, 2000);

    setTimeout(() => {
      this.addBotMessage(this.adminAddProductsExplanation3());
    }, 3500);

    setTimeout(() => {
      this.addBotMessage(this.adminAddProductsExplanation4());
    }, 5000);
  }

  onGoToAddProducts() {
    this.router.navigate(['/admin/send-messages'], { queryParams: { tab: 'products' } });
    this.closeChat();
  }

  onAdminAuctionsManagementClick() {
    this.closeButtonsMenu();
    this.addUserMessage(this.adminAuctionsManagement());
    this.currentStep.set('adminAuctionsManagement');

    setTimeout(() => {
      this.addBotMessage(this.adminAuctionsManagementExplanation1());
    }, 500);

    setTimeout(() => {
      this.addBotMessage(this.adminAuctionsManagementExplanation2());
    }, 2000);

    setTimeout(() => {
      this.addBotMessage(this.adminAuctionsManagementExplanation3());
    }, 3500);

    setTimeout(() => {
      this.addBotMessage(this.adminAuctionsManagementExplanation4());
    }, 5000);
  }

  onGoToAuctionsManagement() {
    this.router.navigate(['/admin/auctions-management']);
    this.closeChat();
  }

  // Dragging functionality
  onMouseDown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const header = target.closest('.chatbot-header');
    if (header && !target.closest('.close-btn')) {
      this.isDragging.set(true);
      const container = header.closest('.chatbot-container') as HTMLElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        // Always calculate from left, even for Arabic (we'll convert in onMouseMove)
        this.dragOffset.set({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
    }
  }

  onMouseMove(event: MouseEvent) {
    if (this.isDragging()) {
      event.preventDefault();
      const containerWidth = 400; // container width
      const maxY = window.innerHeight - 100; // container height

      let newX = event.clientX - this.dragOffset().x;
      const newY = event.clientY - this.dragOffset().y;

      // If Arabic, restrict movement to right side only (right half of screen)
      if (this.translationService.isArabic()) {
        // Calculate from right side
        const minX = window.innerWidth / 2; // Only allow movement in right half
        const maxX = window.innerWidth - containerWidth;
        newX = Math.max(minX, Math.min(newX, maxX));
      } else {
        // For English, allow movement anywhere
        const maxX = window.innerWidth - containerWidth;
        newX = Math.max(0, Math.min(newX, maxX));
      }

      this.position.set({
        x: newX,
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  }

  onMouseUp() {
    this.isDragging.set(false);
  }

  onTouchStart(event: TouchEvent) {
    const target = event.target as HTMLElement;
    const header = target.closest('.chatbot-header');
    if (header && !target.closest('.close-btn')) {
      this.isDragging.set(true);
      const container = header.closest('.chatbot-container') as HTMLElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        const touch = event.touches[0];
        // Always calculate from left, even for Arabic (we'll convert in onTouchMove)
        this.dragOffset.set({
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
        });
      }
    }
  }

  onTouchMove(event: TouchEvent) {
    if (this.isDragging()) {
      event.preventDefault();
      const touch = event.touches[0];
      const containerWidth = 400;
      const maxY = window.innerHeight - 100;

      let newX = touch.clientX - this.dragOffset().x;
      const newY = touch.clientY - this.dragOffset().y;

      // If Arabic, restrict movement to right side only (right half of screen)
      if (this.translationService.isArabic()) {
        // Calculate from right side
        const minX = window.innerWidth / 2; // Only allow movement in right half
        const maxX = window.innerWidth - containerWidth;
        newX = Math.max(minX, Math.min(newX, maxX));
      } else {
        // For English, allow movement anywhere
        const maxX = window.innerWidth - containerWidth;
        newX = Math.max(0, Math.min(newX, maxX));
      }

      this.position.set({
        x: newX,
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  }

  onTouchEnd() {
    this.isDragging.set(false);
  }

  constructor() {
    // Reset when opened
    effect(() => {
      if (this.isOpen()) {
        this.currentStep.set('menu');
        this.messages.set([]);
        // Reset position
        this.position.set({ x: 0, y: 0 });
        setTimeout(() => {
          this.addBotMessage(this.welcomeMessage());
        }, 300);
      }
    });
  }
}
