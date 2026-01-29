import { Injectable, signal, computed } from '@angular/core';

export type Language = 'ar' | 'en';

export interface TranslationKeys {
  // Common
  'common.next': string;
  'common.previous': string;
  'common.submit': string;
  'common.cancel': string;
  'common.loading': string;
  'common.error': string;
  'common.success': string;

  // Floating Menu
  'menu.chatBot': string;
  'menu.privacyPolicy': string;
  'menu.returnPolicy': string;
  'menu.sitePolicy': string;
  'menu.copyright': string;
  'menu.quickReference': string;
  'menu.quickReferenceContent': string;
  'menu.copyrightContent': string;
  'menu.sitePolicyContent': string;
  'menu.returnPolicyContent': string;
  'menu.privacyPolicyContent': string;
  'menu.close': string;
  'menu.changeLanguage': string;
  'menu.changeTheme': string;
  'menu.themePersistent': string;
  'menu.themeDark': string;
  'menu.themeLight': string;
  'menu.changeScheme': string;
  'menu.schemeDefault': string;
  'menu.schemeBasic': string;
  'menu.messages': string;
  'menu.noMessages': string;
  'menu.requestApproved': string;
  'menu.requestRejected': string;
  'menu.requestPending': string;
  'menu.amount': string;
  'menu.date': string;
  'menu.delete': string;
  'menu.deleteMessageConfirm': string;

  // Profile
  'profile.title': string;
  'profile.firstName': string;
  'profile.middleName': string;
  'profile.lastName': string;
  'profile.email': string;
  'profile.nickname': string;
  'profile.phone': string;
  'profile.nationalId': string;
  'profile.walletBalance': string;
  'profile.profileImage': string;
  'profile.changeImage': string;
  'profile.save': string;
  'profile.cancel': string;
  'profile.back': string;
  'profile.loading': string;
  'profile.saving': string;
  'profile.saveSuccess': string;
  'profile.saveError': string;
  'profile.required': string;
  'profile.invalidPhone': string;
  'profile.minLength': string;

  // Chatbot
  'chatbot.welcome': string;
  'chatbot.login': string;
  'chatbot.register': string;
  'chatbot.backToMenu': string;
  'chatbot.loginStep1': string;
  'chatbot.loginStep2': string;
  'chatbot.loginStep3': string;
  'chatbot.loginStep4': string;
  'chatbot.loginStep5': string;
  'chatbot.goToLogin': string;
  'chatbot.registerStep1': string;
  'chatbot.registerStep2': string;
  'chatbot.registerStep3': string;
  'chatbot.registerStep4': string;
  'chatbot.registerStep5': string;
  'chatbot.registerStep6': string;
  'chatbot.registerStep7': string;
  'chatbot.goToRegister': string;
  'chatbot.alreadyRegistered': string;
  'chatbot.theme': string;
  'chatbot.themeExplanation1': string;
  'chatbot.themeExplanation2': string;
  'chatbot.themeExplanation3': string;
  'chatbot.themeExplanation4': string;
  'chatbot.themeExplanation5': string;
  'chatbot.goToTheme': string;
  'chatbot.showOptions': string;
  'chatbot.hideOptions': string;
  'chatbot.about': string;
  'chatbot.aboutExplanation1': string;
  'chatbot.aboutExplanation2': string;
  'chatbot.aboutExplanation3': string;
  'chatbot.aboutExplanation4': string;
  'chatbot.aboutExplanation5': string;
  'chatbot.home': string;
  'chatbot.homeExplanation1': string;
  'chatbot.homeExplanation2': string;
  'chatbot.homeExplanation3': string;
  'chatbot.homeExplanation4': string;
  'chatbot.admin': string;
  'chatbot.adminExplanation1': string;
  'chatbot.adminExplanation2': string;
  'chatbot.adminExplanation3': string;
  'chatbot.adminExplanation4': string;
  'chatbot.adminChangeLanguage': string;
  'chatbot.adminChangeLanguageQuestion': string;
  'chatbot.adminChangeTheme': string;
  'chatbot.adminChangeThemeQuestion': string;
  'chatbot.adminUsersManagement': string;
  'chatbot.adminUsersManagementExplanation1': string;
  'chatbot.adminUsersManagementExplanation2': string;
  'chatbot.adminUsersManagementExplanation3': string;
  'chatbot.adminUsersManagementExplanation4': string;
  'chatbot.adminEditHomePage': string;
  'chatbot.adminEditHomePageExplanation1': string;
  'chatbot.adminEditHomePageExplanation2': string;
  'chatbot.adminEditHomePageExplanation3': string;
  'chatbot.adminEditHomePageExplanation4': string;
  'chatbot.adminMoneyRequests': string;
  'chatbot.adminMoneyRequestsExplanation1': string;
  'chatbot.adminMoneyRequestsExplanation2': string;
  'chatbot.adminMoneyRequestsExplanation3': string;
  'chatbot.adminMoneyRequestsExplanation4': string;
  'chatbot.adminCustomerFeedback': string;
  'chatbot.adminCustomerFeedbackExplanation1': string;
  'chatbot.adminCustomerFeedbackExplanation2': string;
  'chatbot.adminCustomerFeedbackExplanation3': string;
  'chatbot.adminCustomerFeedbackExplanation4': string;
  'chatbot.goToCustomerFeedback': string;
  'chatbot.customerService': string;
  'chatbot.customerServiceExplanation1': string;
  'chatbot.customerServiceExplanation2': string;
  'chatbot.customerServiceExplanation3': string;
  'chatbot.customerServiceExplanation4': string;
  'chatbot.goToCustomerService': string;
  'chatbot.joinUs': string;
  'chatbot.joinUsExplanation1': string;
  'chatbot.joinUsExplanation2': string;
  'chatbot.joinUsExplanation3': string;
  'chatbot.joinUsExplanation4': string;
  'chatbot.goToJoinUs': string;
  'chatbot.adminJobApplications': string;
  'chatbot.adminJobApplicationsExplanation1': string;
  'chatbot.adminJobApplicationsExplanation2': string;
  'chatbot.adminJobApplicationsExplanation3': string;
  'chatbot.adminJobApplicationsExplanation4': string;
  'chatbot.goToJobApplications': string;
  'chatbot.sellProduct': string;
  'chatbot.sellProductExplanation1': string;
  'chatbot.sellProductExplanation2': string;
  'chatbot.sellProductExplanation3': string;
  'chatbot.sellProductExplanation4': string;
  'chatbot.goToSellProduct': string;
  'chatbot.auctions': string;
  'chatbot.auctionsExplanation1': string;
  'chatbot.auctionsExplanation2': string;
  'chatbot.auctionsExplanation3': string;
  'chatbot.auctionsExplanation4': string;
  'chatbot.auctionsExplanation5': string;
  'chatbot.goToAuctions': string;
  'chatbot.adminAuctionProducts': string;
  'chatbot.adminAuctionProductsExplanation1': string;
  'chatbot.adminAuctionProductsExplanation2': string;
  'chatbot.adminAuctionProductsExplanation3': string;
  'chatbot.adminAuctionProductsExplanation4': string;
  'chatbot.goToAuctionProducts': string;
  'chatbot.adminSendMessages': string;
  'chatbot.adminSendMessagesExplanation1': string;
  'chatbot.adminSendMessagesExplanation2': string;
  'chatbot.adminSendMessagesExplanation3': string;
  'chatbot.adminSendMessagesExplanation4': string;
  'chatbot.goToSendMessages': string;
  'chatbot.adminAddProducts': string;
  'chatbot.adminAddProductsExplanation1': string;
  'chatbot.adminAddProductsExplanation2': string;
  'chatbot.adminAddProductsExplanation3': string;
  'chatbot.adminAddProductsExplanation4': string;
  'chatbot.goToAddProducts': string;
  'chatbot.adminAuctionsManagement': string;
  'chatbot.adminAuctionsManagementExplanation1': string;
  'chatbot.adminAuctionsManagementExplanation2': string;
  'chatbot.adminAuctionsManagementExplanation3': string;
  'chatbot.adminAuctionsManagementExplanation4': string;
  'chatbot.goToAuctionsManagement': string;
  'chatbot.deposit': string;
  'chatbot.depositExplanation1': string;
  'chatbot.depositExplanation2': string;
  'chatbot.depositExplanation3': string;
  'chatbot.depositExplanation4': string;
  'chatbot.messages': string;
  'chatbot.messagesExplanation1': string;
  'chatbot.messagesExplanation2': string;
  'chatbot.messagesExplanation3': string;
  'chatbot.messagesExplanation4': string;
  'chatbot.cart': string;
  'chatbot.cartExplanation1': string;
  'chatbot.cartExplanation2': string;
  'chatbot.cartExplanation3': string;
  'chatbot.cartExplanation4': string;
  'chatbot.cartExplanation5': string;
  'chatbot.goToCart': string;
  'chatbot.profile': string;
  'chatbot.profileExplanation1': string;
  'chatbot.profileExplanation2': string;
  'chatbot.profileExplanation3': string;
  'chatbot.profileExplanation4': string;
  'chatbot.profileExplanation5': string;
  'chatbot.goToProfile': string;
  'customerService.title': string;
  'customerService.category': string;
  'customerService.subject': string;
  'customerService.message': string;
  'customerService.submit': string;
  'customerService.cancel': string;
  'customerService.successMessage': string;
  'customerService.errorMessage': string;
  'customerService.deleteAccount': string;
  'customerService.depositIssue': string;
  'customerService.productIssue': string;
  'customerService.technicalIssue': string;
  'customerService.generalInquiry': string;
  'customerService.complaint': string;
  'admin.customerFeedback.title': string;
  'admin.customerFeedback.category': string;
  'admin.customerFeedback.subject': string;
  'admin.customerFeedback.message': string;
  'admin.customerFeedback.status': string;
  'admin.customerFeedback.createdAt': string;
  'admin.customerFeedback.actions': string;
  'admin.customerFeedback.respond': string;
  'admin.customerFeedback.adminResponse': string;
  'admin.customerFeedback.pending': string;
  'admin.customerFeedback.inProgress': string;
  'admin.customerFeedback.resolved': string;
  'admin.customerFeedback.closed': string;
  'admin.customerFeedback.noTickets': string;
  'admin.customerFeedback.back': string;
  'admin.customerFeedback.delete': string;
  'admin.jobApplications.title': string;
  'admin.jobApplications.category': string;
  'admin.jobApplications.backupEmail': string;
  'admin.jobApplications.whatsappPhone': string;
  'admin.jobApplications.linkedinUrl': string;
  'admin.jobApplications.githubUrl': string;
  'admin.jobApplications.facebookUrl': string;
  'admin.jobApplications.cvFile': string;
  'admin.jobApplications.experience': string;
  'admin.jobApplications.status': string;
  'admin.jobApplications.createdAt': string;
  'admin.jobApplications.actions': string;
  'admin.jobApplications.respond': string;
  'admin.jobApplications.adminNote': string;
  'admin.jobApplications.accept': string;
  'admin.jobApplications.reject': string;
  'admin.jobApplications.delete': string;
  'admin.jobApplications.pending': string;
  'sellProduct.title': string;
  'sellProduct.productName': string;
  'sellProduct.mainImage': string;
  'sellProduct.additionalImages': string;
  'sellProduct.startingPrice': string;
  'sellProduct.submit': string;
  'sellProduct.cancel': string;
  'sellProduct.successMessage': string;
  'sellProduct.errorMessage': string;
  'sellProduct.selectMainImage': string;
  'sellProduct.removeMainImage': string;
  'sellProduct.selectAdditionalImages': string;
  'sellProduct.removeAdditionalImage': string;
  'sellProduct.invalidPrice': string;
  'sellProduct.maxImages': string;
  'admin.auctionProducts.title': string;
  'admin.auctionProducts.startingPrice': string;
  'admin.auctionProducts.status': string;
  'admin.auctionProducts.createdAt': string;
  'admin.auctionProducts.actions': string;
  'admin.auctionProducts.approve': string;
  'admin.auctionProducts.reject': string;
  'admin.auctionProducts.adminNote': string;
  'admin.auctionProducts.pending': string;
  'admin.auctionProducts.approved': string;
  'admin.auctionProducts.rejected': string;
  'admin.auctionProducts.noProducts': string;
  'admin.auctionProducts.back': string;
  'admin.auctionProducts.delete': string;
  'admin.auctionProducts.sendResponse': string;
  'admin.auctionProducts.cancel': string;
  'admin.auctionProducts.mainImage': string;
  'admin.auctionProducts.additionalImages': string;
  'admin.jobApplications.accepted': string;
  'admin.jobApplications.rejected': string;
  'admin.jobApplications.noApplications': string;
  'admin.jobApplications.back': string;
  'admin.jobApplications.submit': string;
  'admin.jobApplications.cancel': string;
  'joinUs.title': string;
  'joinUs.category': string;
  'joinUs.backupEmail': string;
  'joinUs.whatsappPhone': string;
  'joinUs.linkedinUrl': string;
  'joinUs.githubUrl': string;
  'joinUs.facebookUrl': string;
  'joinUs.cvFile': string;
  'joinUs.experience': string;
  'joinUs.submit': string;
  'joinUs.cancel': string;
  'joinUs.successMessage': string;
  'joinUs.errorMessage': string;
  'joinUs.selectFile': string;
  'joinUs.removeFile': string;
  'joinUs.invalidEmail': string;
  'joinUs.invalidUrl': string;
  'joinUs.minLength': string;
  'joinUs.frontendDeveloper': string;
  'joinUs.backendDeveloper': string;
  'joinUs.fullStackDeveloper': string;
  'joinUs.uiUxDesigner': string;
  'joinUs.graphicDesigner': string;
  'joinUs.marketingSpecialist': string;
  'joinUs.contentWriter': string;
  'joinUs.dataAnalyst': string;
  'joinUs.projectManager': string;
  'joinUs.other': string;
  'usersManagement.refreshChart': string;
  'usersManagement.refreshingChart': string;
  'chatbot.yes': string;
  'chatbot.no': string;

  // Navbar
  'navbar.home': string;
  'navbar.auctions': string;
  'navbar.joinUs': string;
  'navbar.customerService': string;
  'navbar.sellProduct': string;
  'navbar.categories': string;
  'navbar.about': string;
  'navbar.contact': string;
  'navbar.card': string;
  'navbar.profile': string;
  'navbar.statistics': string;
  'navbar.wallet': string;
  'navbar.walletAddFunds': string;
  'navbar.walletInstaPay': string;
  'navbar.walletAmount': string;
  'navbar.walletPhoneNumber': string;
  'navbar.walletDepositImage': string;
  'navbar.walletSubmitRequest': string;
  'navbar.messages': string;
  'navbar.noMessages': string;
  'navbar.requestApproved': string;
  'navbar.requestRejected': string;
  'navbar.requestPending': string;
  'navbar.walletPrivacyPolicy': string;
  'navbar.walletReviewingData': string;
  'navbar.walletAddFundsSuccess': string;
  'navbar.walletOK': string;
  'navbar.walletCancel': string;
  'navbar.login': string;
  'navbar.register': string;
  'navbar.logout': string;

  // Admin Money Requests
  'admin.moneyRequests.title': string;
  'admin.moneyRequests.amount': string;
  'admin.moneyRequests.user': string;
  'admin.moneyRequests.phoneNumber': string;
  'admin.moneyRequests.status': string;
  'admin.moneyRequests.depositImage': string;
  'admin.moneyRequests.createdAt': string;
  'admin.moneyRequests.actions': string;
  'admin.moneyRequests.approve': string;
  'admin.moneyRequests.reject': string;
  'admin.moneyRequests.reviewNote': string;
  'admin.moneyRequests.pending': string;
  'admin.moneyRequests.approved': string;
  'admin.moneyRequests.rejected': string;
  'admin.moneyRequests.noRequests': string;
  'admin.moneyRequests.back': string;
  'admin.moneyRequests.delete': string;
  'admin.moneyRequests.deleteRequestConfirm': string;

  // Admin Send Messages
  'admin.sendMessages.title': string;
  'admin.sendMessages.selectUser': string;
  'admin.sendMessages.searchUser': string;
  'admin.sendMessages.messageSubject': string;
  'admin.sendMessages.messageText': string;
  'admin.sendMessages.enterSubject': string;
  'admin.sendMessages.enterMessage': string;
  'admin.sendMessages.sendMessage': string;
  'admin.sendMessages.sending': string;
  'admin.sendMessages.success': string;
  'admin.sendMessages.error': string;
  'admin.sendMessages.back': string;
  'admin.sendMessages.cancel': string;

  // Home Page
  'home.hero.title': string;
  'home.hero.subtitle': string;
  'home.howItWorks.title': string;
  'home.howItWorks.step1.title': string;
  'home.howItWorks.step1.description': string;
  'home.howItWorks.step2.title': string;
  'home.howItWorks.step2.description': string;
  'home.featuredAuctions.title': string;
  'home.stats.title': string;
  'home.stats.totalUsers': string;
  'home.stats.totalProducts': string;
  'home.stats.endedAuctions': string;
  'home.projectJourney.title': string;
  'home.projectJourney.subtitle': string;
  'home.projectJourney.point1.title': string;
  'home.projectJourney.point1.content': string;
  'home.projectJourney.point2.title': string;
  'home.projectJourney.point2.content': string;
  'home.projectJourney.point3.title': string;
  'home.projectJourney.point3.content': string;
  'home.projectJourney.point4.title': string;
  'home.projectJourney.point4.content': string;
  'home.projectJourney.point5.title': string;
  'home.projectJourney.point5.content': string;
  'home.projectJourney.point6.title': string;
  'home.projectJourney.point6.content': string;
  'home.projectJourney.point7.title': string;
  'home.projectJourney.point7.content': string;
  'home.projectJourney.point8.title': string;
  'home.projectJourney.point8.content': string;
  'home.projectJourney.point9.title': string;
  'home.projectJourney.point9.content': string;
  'home.projectJourney.point10.title': string;
  'home.projectJourney.point10.content': string;
  'home.projectJourney.modal.close': string;
  'home.contact.title': string;
  'home.contact.subtitle': string;
  'home.contact.button': string;

  // Auctions
  'auctions.title': string;
  'auctions.searchPlaceholder': string;
  'auctions.category': string;
  'auctions.allCategories': string;
  'auctions.filters': string;
  'auctions.priceRange': string;
  'auctions.sortBy': string;
  'auctions.newest': string;
  'auctions.oldest': string;
  'auctions.priceLowToHigh': string;
  'auctions.priceHighToLow': string;
  'auctions.noProducts': string;
  'auctions.startingPrice': string;
  'auctions.currentBid': string;
  'auctions.viewDetails': string;
  'auctions.applyFilters': string;
  'auctions.clearFilters': string;
  'auctions.closeFilters': string;
  'auctions.categories.all': string;
  'auctions.categories.electronics': string;
  'auctions.categories.fashion': string;
  'auctions.categories.home': string;
  'auctions.categories.vehicles': string;
  'auctions.categories.art': string;
  'auctions.categories.jewelry': string;
  'auctions.categories.books': string;
  'auctions.categories.sports': string;
  'auctions.categories.other': string;
  'auctions.sellers': string;
  'auctions.sellersModal.title': string;
  'auctions.sellersModal.totalAuctions': string;
  'auctions.sellersModal.likes': string;
  'auctions.sellersModal.rating': string;
  'auctions.sellersModal.noSellers': string;
  'auctions.sellersModal.close': string;

  // Footer
  'footer.about': string;
  'footer.quickLinks': string;
  'footer.legal': string;
  'footer.contact': string;
  'footer.followUs': string;
  'footer.allRightsReserved': string;

  // Registration
  'register.welcome': string;
  'register.personalInfo': string;
  'register.fullName': string;
  'register.firstName': string;
  'register.middleName': string;
  'register.lastName': string;
  'register.nickname': string;
  'register.phoneNumber': string;
  'register.nationalId': string;
  'register.email': string;
  'register.verifyEmail': string;
  'register.verificationCode': string;
  'register.password': string;
  'register.confirmPassword': string;
  'register.reviewInfo': string;
  'register.success': string;
  'register.successMessage': string;
  'register.redirecting': string;
  'register.goToLogin': string;

  // Login
  'login.welcome': string;
  'login.welcomeBack': string;
  'login.email': string;
  'login.password': string;
  'login.rememberMe': string;
  'login.rememberMeInfo': string;
  'login.reviewInfo': string;
  'login.verifyCode': string;
  'login.welcomeBackTitle': string;
  'login.welcomeBackMessage': string;
  'login.redirecting': string;
  'login.verifyAndLogin': string;
  'login.verifying': string;
  'login.loggingIn': string;

  // Validation Messages
  'validation.required': string;
  'validation.email': string;
  'validation.minLength': string;
  'validation.passwordMismatch': string;
  'validation.invalidPhone': string;
  'validation.invalidNationalId': string;
  'validation.nationalIdExists': string;
  'validation.emailExists': string;
  'validation.nicknameExists': string;
  'validation.phoneExists': string;
  'validation.weakPassword': string;
  'validation.mediumPassword': string;
  'validation.strongPassword': string;
  'validation.nameRequired': string;
  'validation.nicknameRequired': string;
  'validation.passwordMinLength': string;
  'validation.verificationCode': string;
  'validation.verificationCode6Digits': string;

  // Errors
  'error.invalidEmail': string;
  'error.invalidCode': string;
  'error.codeExpired': string;
  'error.registrationFailed': string;
  'error.loginFailed': string;
}

const translations: Record<Language, TranslationKeys> = {
  ar: {
    // Common
    'common.next': 'التالي',
    'common.previous': 'السابق',
    'common.submit': 'إرسال',
    'common.cancel': 'إلغاء',
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',

    // Floating Menu
    'menu.chatBot': 'شات بوت',
    'menu.privacyPolicy': 'سياسة الخصوصية',
    'menu.returnPolicy': 'سياسة الإرجاع',
    'menu.sitePolicy': 'سياسة الموقع',
    'menu.copyright': 'حقوق الطبع',
    'menu.quickReference': 'مرجع سريع',
    'menu.quickReferenceContent':
      'مرجع سريع لاستخدام منصة Mazzady:\n\n• تصفح المزادات الحية\n• المزايدة على المنتجات\n• متابعة المزادات المفضلة\n• إدارة حسابك الشخصي\n• التواصل مع البائعين\n• تصفح الفئات المختلفة',
    'menu.copyrightContent':
      '© 2026 Mazzady. جميع الحقوق محفوظة.\n\nهذا الموقع ومحتواه محمي بحقوق الطبع والنشر. لا يُسمح بنسخ أو توزيع أي جزء من هذا الموقع دون إذن كتابي من Mazzady.',
    'menu.sitePolicyContent':
      'سياسة استخدام الموقع:\n\n• يجب على المستخدمين الالتزام بشروط الاستخدام\n• يُمنع استخدام الموقع لأغراض غير قانونية\n• يحتفظ Mazzady بالحق في تعديل السياسات في أي وقت\n• المستخدمون مسؤولون عن أمان حساباتهم\n• يُمنع نشر محتوى مسيء أو غير لائق',
    'menu.returnPolicyContent':
      'سياسة الإرجاع والاستبدال:\n\n• يمكن إرجاع المنتجات خلال 14 يوم من تاريخ الاستلام\n• يجب أن يكون المنتج في حالته الأصلية\n• المنتجات المخصصة غير قابلة للإرجاع\n• سيتم استرداد المبلغ خلال 5-7 أيام عمل\n• للاستفسارات، يرجى التواصل مع خدمة العملاء',
    'menu.privacyPolicyContent':
      'سياسة الخصوصية:\n\n• نحن نحمي معلوماتك الشخصية بصرامة\n• لا نشارك بياناتك مع أطراف ثالثة\n• نستخدم التشفير لحماية بياناتك\n• يمكنك طلب حذف بياناتك في أي وقت\n• نحن نلتزم بمعايير حماية البيانات الدولية',
    'menu.close': 'إغلاق',
    'menu.changeLanguage': 'تغيير اللغة',
    'menu.changeTheme': 'تغيير الثيم',
    'menu.themePersistent': 'إبقاء الثيم ثابت',
    'menu.themeDark': 'داكن',
    'menu.themeLight': 'فاتح',
    'menu.changeScheme': 'تغيير السيم',
    'menu.schemeDefault': 'كلاسيكي',
    'menu.schemeBasic': 'بازيك',
    'menu.messages': 'الرسائل',
    'menu.noMessages': 'لا توجد رسائل',
    'menu.requestApproved': 'تمت الموافقة',
    'menu.requestRejected': 'تم الرفض',
    'menu.requestPending': 'قيد المراجعة',
    'menu.amount': 'المبلغ',
    'menu.date': 'التاريخ',
    'menu.delete': 'حذف',
    'menu.deleteMessageConfirm': 'هل أنت متأكد من حذف هذه الرسالة؟',

    // Profile
    'profile.title': 'الملف الشخصي',
    'profile.firstName': 'الاسم الأول',
    'profile.middleName': 'الاسم الأوسط',
    'profile.lastName': 'الاسم الأخير',
    'profile.email': 'البريد الإلكتروني',
    'profile.nickname': 'الاسم المستعار',
    'profile.phone': 'رقم الهاتف',
    'profile.nationalId': 'الرقم القومي',
    'profile.walletBalance': 'رصيد المحفظة',
    'profile.profileImage': 'الصورة الشخصية',
    'profile.changeImage': 'تغيير الصورة',
    'profile.save': 'حفظ',
    'profile.cancel': 'إلغاء',
    'profile.back': 'رجوع',
    'profile.loading': 'جاري التحميل...',
    'profile.saving': 'جاري الحفظ...',
    'profile.saveSuccess': 'تم حفظ التغييرات بنجاح',
    'profile.saveError': 'حدث خطأ أثناء الحفظ',
    'profile.required': 'هذا الحقل مطلوب',
    'profile.invalidPhone': 'رقم الهاتف غير صحيح',
    'profile.minLength': 'يجب أن يكون على الأقل حرفين',

    // Chatbot
    'chatbot.welcome': 'مرحباً! أنا مساعد Mazzady. كيف يمكنني مساعدتك اليوم؟',
    'chatbot.login': 'تسجيل الدخول',
    'chatbot.register': 'إضافة حساب جديد',
    'chatbot.backToMenu': 'العودة إلى القائمة',
    'chatbot.loginStep1': 'الخطوة 1: أدخل بريدك الإلكتروني',
    'chatbot.loginStep2': 'الخطوة 2: أدخل كلمة المرور واختر "تذكرني"',
    'chatbot.loginStep3': 'الخطوة 3: راجع بياناتك',
    'chatbot.loginStep4': 'الخطوة 4: أدخل كود التحقق (6 أرقام)',
    'chatbot.loginStep5': 'الخطوة 5: مرحباً بعودتك! سيتم توجيهك تلقائياً',
    'chatbot.goToLogin': 'الذهاب إلى صفحة تسجيل الدخول',
    'chatbot.registerStep1': 'الخطوة 1: أدخل الاسم الثلاثي (الأول، الأوسط، الأخير) والنيك نيم',
    'chatbot.registerStep2': 'الخطوة 2: أدخل رقم التليفون المصري',
    'chatbot.registerStep3': 'الخطوة 3: أدخل البريد الإلكتروني (سيتم إرسال كود التحقق تلقائياً)',
    'chatbot.registerStep4': 'الخطوة 4: أدخل كود التحقق (6 أرقام، صلاحية 10 دقائق)',
    'chatbot.registerStep5': 'الخطوة 5: أدخل كلمة المرور وتأكيدها',
    'chatbot.registerStep6': 'الخطوة 6: راجع جميع بياناتك',
    'chatbot.registerStep7': 'الخطوة 7: تم التسجيل بنجاح! سيتم توجيهك تلقائياً',
    'chatbot.goToRegister': 'الذهاب إلى صفحة التسجيل',
    'chatbot.alreadyRegistered': 'أنت بالفعل مسجل! يمكنك استخدام حسابك الحالي.',
    'chatbot.theme': 'تغيير الثيم',
    'chatbot.themeExplanation1':
      'زر تغيير الثيم يسمح لك بالتبديل بين الوضع الداكن (Dark) والوضع الفاتح (Light).',
    'chatbot.themeExplanation2':
      'عند تفعيل "إبقاء الثيم ثابت"، سيتم حفظ تفضيلك وسيبقى الثيم كما اخترت حتى بعد إعادة فتح الموقع.',
    'chatbot.themeExplanation3':
      'يمكنك العثور على زر تغيير الثيم في القائمة العائمة (Floating Menu) في أسفل يسار الصفحة.',
    'chatbot.themeExplanation4':
      'الوضع الداكن مناسب للاستخدام في الإضاءة المنخفضة، بينما الوضع الفاتح مناسب للاستخدام في الإضاءة العالية.',
    'chatbot.themeExplanation5':
      'جميع الألوان تتغير مع الثيم ما عدا اللون الذهبي وألوان رسائل التحقق (الأخضر والأحمر).',
    'chatbot.goToTheme': 'الذهاب إلى القائمة لتغيير الثيم',
    'chatbot.showOptions': 'عرض الخيارات',
    'chatbot.hideOptions': 'إخفاء الخيارات',
    'chatbot.about': 'عن الشات بوت',
    'chatbot.aboutExplanation1':
      'مرحباً! أنا مساعد Mazzady الذكي، وأنا هنا لمساعدتك في فهم واستخدام الموقع بسهولة.',
    'chatbot.aboutExplanation2':
      'يمكنني مساعدتك في: شرح خطوات تسجيل الدخول، شرح خطوات إنشاء حساب جديد، شرح كيفية تغيير الثيم (Dark/Light Mode)، والإجابة على أسئلتك حول الموقع.',
    'chatbot.aboutExplanation3':
      'يمكنك سحبي من الـ Header في أي مكان على الشاشة. في اللغة العربية، أتحرك فقط في الجانب الأيمن من الشاشة لسهولة الاستخدام.',
    'chatbot.aboutExplanation4':
      'أنا مصمم ليكون سهل الاستخدام - فقط اختر من الأزرار المتاحة وسأشرح لك كل شيء خطوة بخطوة.',
    'chatbot.aboutExplanation5':
      'إذا كان لديك أي سؤال أو تحتاج مساعدة، فقط اختر أحد الخيارات من القائمة وسأكون سعيداً لمساعدتك!',
    'chatbot.home': 'الصفحة الرئيسية',
    'chatbot.homeExplanation1':
      'صفحة Mazzady الرئيسية هي نقطة البداية لرحلتك في عالم المزادات الإلكترونية.',
    'chatbot.homeExplanation2':
      'الصفحة مصممة لتكون واجهة جذابة وسهلة الاستخدام، تبدأ بـ Hero Section مع صور متحركة تعرض أفضل المنتجات والمزادات.',
    'chatbot.homeExplanation3':
      'ثم يأتي قسم "كيف يعمل التطبيق" الذي يشرح لك خطوة بخطوة كيفية المشاركة في المزادات والاستفادة من الخدمات.',
    'chatbot.homeExplanation4':
      'الصفحة مصممة لتكون سريعة وسلسة، مع دعم كامل للغتين العربية والإنجليزية، وتتوافق مع الثيم الداكن والفاتح.',
    'chatbot.admin': 'عن لوحة التحكم',
    'chatbot.adminExplanation1':
      'لوحة تحكم الأدمن هي المكان الذي يدير فيه المسؤولون جميع جوانب منصة Mazzady.',
    'chatbot.adminExplanation2':
      'من هنا يمكن للأدمن إدارة المستخدمين، المنتجات، المزادات، الطلبات، والإعدادات العامة للمنصة.',
    'chatbot.adminExplanation3':
      'لوحة التحكم مصممة لتكون آمنة وسهلة الاستخدام، مع واجهة احترافية توفر جميع الأدوات اللازمة للإدارة الفعالة.',
    'chatbot.adminExplanation4':
      'جميع العمليات في لوحة التحكم محمية ومؤمنة، وتتطلب تسجيل دخول خاص بالأدمن فقط.',
    'chatbot.adminChangeLanguage': 'تغيير اللغة',
    'chatbot.adminChangeLanguageQuestion': 'هل تريد تغيير اللغة؟',
    'chatbot.adminChangeTheme': 'تغيير الثيم',
    'chatbot.adminChangeThemeQuestion': 'هل تريد تغيير الثيم؟',
    'chatbot.adminUsersManagement': 'إدارة المستخدمين',
    'chatbot.adminUsersManagementExplanation1':
      'صفحة إدارة المستخدمين تتيح لك عرض وإدارة جميع المستخدمين المسجلين في المنصة.',
    'chatbot.adminUsersManagementExplanation2':
      'يمكنك رؤية إحصائيات شاملة: إجمالي المستخدمين، المستخدمين الأونلاين، المستخدمين الأوفلاين، وإجمالي الزيارات في الشهر.',
    'chatbot.adminUsersManagementExplanation3':
      'الرسم البياني يعرض نسبة زيارة كل مستخدم في الشهر الحالي، ويتحدث تلقائياً مع كل زيارة جديدة.',
    'chatbot.adminUsersManagementExplanation4':
      'يمكنك أيضاً حذف أي مستخدم من الجدول، مع إمكانية عرض جميع بياناته: الاسم، البريد الإلكتروني، النيك نيم، رقم الهاتف، والحالة (أونلاين/أوفلاين).',
    'chatbot.adminEditHomePage': 'تعديل الصفحة الرئيسية',
    'chatbot.adminEditHomePageExplanation1':
      'صفحة تعديل الصفحة الرئيسية تتيح لك إدارة الصور المعروضة في صفحة Home.',
    'chatbot.adminEditHomePageExplanation2':
      'يمكنك إضافة صور Hero Section (الكورسيل) التي تظهر في أعلى الصفحة، ويمكنك إضافة ما يصل إلى 7 صور.',
    'chatbot.adminEditHomePageExplanation3':
      'يمكنك أيضاً إضافة صور How It Works Section التي تظهر في قسم "كيف يعمل التطبيق".',
    'chatbot.adminEditHomePageExplanation4':
      'بعد إضافة الصور، اضغط على "حفظ التغييرات" وسيتم رفعها تلقائياً إلى الخادم وعرضها في صفحة Home مباشرة.',
    'chatbot.adminMoneyRequests': 'طلبات الإيداع',
    'chatbot.adminMoneyRequestsExplanation1':
      'صفحة طلبات الإيداع تتيح لك مراجعة وإدارة جميع طلبات إضافة الرصيد من المستخدمين.',
    'chatbot.adminMoneyRequestsExplanation2':
      'يمكنك رؤية تفاصيل كل طلب: المستخدم، المبلغ، رقم الهاتف، صورة الإيداع، والتاريخ.',
    'chatbot.adminMoneyRequestsExplanation3':
      'يمكنك الموافقة على الطلب (سيتم إضافة المبلغ تلقائياً إلى رصيد المستخدم) أو رفضه مع إضافة ملاحظة.',
    'chatbot.adminMoneyRequestsExplanation4':
      'يمكنك أيضاً حذف أي طلب من القائمة. جميع الطلبات مرتبة حسب التاريخ (الأحدث أولاً).',
    'chatbot.adminCustomerFeedback': 'استفسارات العملاء',
    'chatbot.adminCustomerFeedbackExplanation1':
      'صفحة استفسارات العملاء تتيح لك مراجعة وإدارة جميع رسائل خدمة العملاء من المستخدمين.',
    'chatbot.adminCustomerFeedbackExplanation2':
      'يمكنك رؤية تفاصيل كل رسالة: المستخدم، الفئة، الموضوع، الرسالة، والحالة.',
    'chatbot.adminCustomerFeedbackExplanation3':
      'يمكنك الرد على الرسائل وتحديث حالتها (قيد الانتظار، قيد المعالجة، تم الحل، مغلق).',
    'chatbot.adminCustomerFeedbackExplanation4':
      'سيتم إرسال ردك إلى المستخدم في صفحة الرسائل الخاصة به في Floating Menu.',
    'chatbot.goToCustomerFeedback': 'الذهاب إلى استفسارات العملاء',
    'chatbot.customerService': 'خدمة العملاء',
    'chatbot.customerServiceExplanation1':
      'صفحة خدمة العملاء تتيح لك إرسال رسائل للمساعدة والدعم الفني.',
    'chatbot.customerServiceExplanation2':
      'يمكنك اختيار الفئة المناسبة لمشكلتك: حذف حساب، مشكلة إيداع، مشكلة في المنتج، مشكلة تقنية، استفسار عام، أو شكوى.',
    'chatbot.customerServiceExplanation3':
      'اكتب عنوان ووصف واضح لمشكلتك، وسيقوم فريق الدعم بالرد عليك في أقرب وقت ممكن.',
    'chatbot.customerServiceExplanation4':
      'سيتم إرسال رد الأدمن إلى صفحة الرسائل الخاصة بك في Floating Menu.',
    'chatbot.goToCustomerService': 'الذهاب إلى خدمة العملاء',
    'chatbot.joinUs': 'انضم إلينا',
    'chatbot.joinUsExplanation1':
      'يمكنك التقدم للانضمام إلى فريق Mazzady من خلال صفحة "انضم إلينا".',
    'chatbot.joinUsExplanation2': 'ستحتاج إلى اختيار الوظيفة المناسبة لك من القائمة المتاحة.',
    'chatbot.joinUsExplanation3':
      'أضف معلوماتك الشخصية، روابط التواصل الاجتماعي، وملف السيرة الذاتية.',
    'chatbot.joinUsExplanation4': 'بعد إرسال الطلب، سنراجع طلبك وسنتواصل معك قريباً.',
    'chatbot.goToJoinUs': 'انتقل إلى صفحة انضم إلينا',
    'chatbot.adminJobApplications': 'طلبات التوظيف',
    'chatbot.adminJobApplicationsExplanation1':
      'يمكنك عرض وإدارة جميع طلبات التوظيف من صفحة "طلبات التوظيف".',
    'chatbot.adminJobApplicationsExplanation2':
      'سترى معلومات المتقدمين، ملفات السيرة الذاتية، والخبرات.',
    'chatbot.adminJobApplicationsExplanation3':
      'يمكنك قبول أو رفض الطلبات مع إضافة ملاحظة من الأدمن.',
    'chatbot.adminJobApplicationsExplanation4': 'يمكنك أيضاً حذف الطلبات بعد القبول أو الرفض.',
    'chatbot.goToJobApplications': 'انتقل إلى صفحة طلبات التوظيف',
    'chatbot.sellProduct': 'اعرض المنتج الخاص بك',
    'chatbot.sellProductExplanation1': 'يمكنك عرض منتجك في المزاد من خلال صفحة "اعرض منتجك".',
    'chatbot.sellProductExplanation2': 'ستحتاج إلى رفع صورة رئيسية للمنتج وحد أقصى 9 صور فرعية.',
    'chatbot.sellProductExplanation3': 'أدخل السعر المبدئي للمنتج الذي تريد بيعه في المزاد.',
    'chatbot.sellProductExplanation4':
      'بعد إرسال الطلب، سيتم مراجعته من قبل الأدمن. عند الموافقة، سيتم التواصل معك قريباً.',
    'chatbot.goToSellProduct': 'انتقل إلى صفحة اعرض منتجك',
    'chatbot.auctions': 'المزادات',
    'chatbot.auctionsExplanation1':
      'المزادات هي منصة لعرض المنتجات والمزايدة عليها. يمكنك تصفح المزادات النشطة والمزايدة على المنتجات التي تهمك.',
    'chatbot.auctionsExplanation2':
      'وقت المزايدة: يمكنك المزايدة في أي وقت أثناء المزاد النشط. يجب أن تكون مزايدتك أعلى من السعر الحالي على الأقل بمقدار "أقل معدل للزيادة" المحدد لكل مزاد.',
    'chatbot.auctionsExplanation3':
      'بعد الفوز بالمزاد: عند انتهاء المزاد، إذا كنت صاحب أعلى مزايدة، سيتم خصم المبلغ من رصيدك في المحفظة تلقائياً. يجب أن يتوفر لديك رصيد كافٍ في المحفظة قبل المزايدة.',
    'chatbot.auctionsExplanation4':
      'نصائح مهمة: يجب أن تكون متنبهاً لوقت انتهاء المزاد - يمكنك رؤية العداد التنازلي في كل مزاد. تأكد من وجود رصيد كافٍ في محفظتك قبل المزايدة. المزايدة ملزمة - لا يمكن التراجع عنها بعد تأكيدها.',
    'chatbot.auctionsExplanation5':
      'يمكنك متابعة المزادات المفضلة، ومشاهدة جميع المزايدات في الوقت الفعلي، ومعرفة من هو صاحب أعلى مزايدة حالياً.',
    'chatbot.goToAuctions': 'انتقل إلى صفحة المزادات',
    'chatbot.adminAuctionProducts': 'المنتجات',
    'chatbot.adminAuctionProductsExplanation1':
      'يمكنك عرض وإدارة جميع منتجات المزاد من صفحة "منتجات المزاد".',
    'chatbot.adminAuctionProductsExplanation2':
      'سترى معلومات المستخدم، الصور، والسعر المبدئي لكل منتج.',
    'chatbot.adminAuctionProductsExplanation3':
      'يمكنك الموافقة على المنتج أو رفضه مع إضافة ملاحظة في حالة الرفض.',
    'chatbot.adminAuctionProductsExplanation4': 'يمكنك أيضاً حذف المنتجات بعد الموافقة أو الرفض.',
    'chatbot.goToAuctionProducts': 'انتقل إلى صفحة منتجات المزاد',
    'chatbot.adminSendMessages': 'إرسال الرسائل',
    'chatbot.adminSendMessagesExplanation1':
      'صفحة إرسال الرسائل تتيح لك إرسال رسائل لأي مستخدم مسجل في الموقع.',
    'chatbot.adminSendMessagesExplanation2':
      'يمكنك البحث عن المستخدمين باستخدام اسم المستخدم أو البريد الإلكتروني أو النيك نيم.',
    'chatbot.adminSendMessagesExplanation3':
      'يمكنك كتابة عنوان الرسالة ونص الرسالة، ثم إرسالها للمستخدم مباشرة.',
    'chatbot.adminSendMessagesExplanation4':
      'سيتم إرسال الرسالة للمستخدم وستظهر في صفحة الرسائل الخاصة به في Floating Menu.',
    'chatbot.goToSendMessages': 'انتقل إلى صفحة إرسال الرسائل',
    'chatbot.adminAddProducts': 'إضافة المنتجات للمستخدم',
    'chatbot.adminAddProductsExplanation1':
      'يمكنك إضافة منتجات جديدة للمستخدمين من خلال صفحة "إرسال الرسائل وإدارة المبيعات".',
    'chatbot.adminAddProductsExplanation2':
      'ستحتاج إلى: اسم المنتج، السعر، صورة المنتج، واختيار المستخدم الذي سيتم إضافة المنتج له.',
    'chatbot.adminAddProductsExplanation3':
      'بعد إضافة المنتج، سيتم إضافته تلقائياً إلى كارت المستخدم المحدد.',
    'chatbot.adminAddProductsExplanation4':
      'يمكنك عرض جميع المنتجات المضافة، وإذا تم دفع المنتج، ستظهر حالة "تم الدفع" مع زر "تفاصيل الدفع" لعرض العنوان وكل التفاصيل.',
    'chatbot.goToAddProducts': 'انتقل إلى صفحة إدارة المنتجات',
    'chatbot.adminAuctionsManagement': 'إدارة المزادات',
    'chatbot.adminAuctionsManagementExplanation1':
      'صفحة إدارة المزادات تتيح لك إضافة وإدارة جميع المزادات في الموقع.',
    'chatbot.adminAuctionsManagementExplanation2':
      'يمكنك إضافة مزادات جديدة مع تحديد المنتج، السعر المبدئي، المدة، والصورة الرئيسية والصور الفرعية.',
    'chatbot.adminAuctionsManagementExplanation3':
      'يمكنك عرض جميع المزادات النشطة والمنتهية، ومعرفة الفائزين في المزادات المنتهية.',
    'chatbot.adminAuctionsManagementExplanation4':
      'يمكنك حذف المزادات، ومعرفة معلومات الفائزين في المزادات المنتهية.',
    'chatbot.goToAuctionsManagement': 'انتقل إلى صفحة إدارة المزادات',
    'chatbot.deposit': 'إضافة رصيد',
    'chatbot.depositExplanation1': 'يمكنك إضافة رصيد إلى محفظتك عبر InstaPay.',
    'chatbot.depositExplanation2':
      'اضغط على أيقونة المحفظة في Navbar، ثم اختر "InstaPay" من القائمة المنسدلة.',
    'chatbot.depositExplanation3':
      'أدخل المبلغ المطلوب، وارفع صورة إيصال الإيداع (يجب أن تكون صورة واضحة).',
    'chatbot.depositExplanation4':
      'بعد إرسال الطلب، سيتم مراجعته من قبل الأدمن. عند الموافقة، سيتم إضافة المبلغ تلقائياً إلى رصيدك.',
    'chatbot.messages': 'الرسائل',
    'chatbot.messagesExplanation1': 'يمكنك عرض جميع رسائل الموافقة/الرفض لطلبات الإيداع الخاصة بك.',
    'chatbot.messagesExplanation2':
      'الرسائل تظهر في Floating Menu (القائمة العائمة في أسفل يسار الصفحة) أو في Navbar.',
    'chatbot.messagesExplanation3':
      'كل رسالة تحتوي على: حالة الطلب (موافق عليه/مرفوض)، المبلغ، التاريخ، وملاحظة المراجعة (إن وجدت).',
    'chatbot.messagesExplanation4':
      'الرسائل تتحدث تلقائياً كل 30 ثانية، ويمكنك فتحها في أي وقت من Floating Menu.',
    'chatbot.cart': 'السلة',
    'chatbot.cartExplanation1': 'السلة تتيح لك عرض وإدارة المنتجات التي أضفتها للشراء.',
    'chatbot.cartExplanation2': 'يمكنك اختيار طريقة الشحن (بري/جوي) والتأمين (10% من سعر المنتج).',
    'chatbot.cartExplanation3':
      'عند الضغط على "شراء"، سيتم فتح مودال لإدخال عنوان الشحن (الدولة، المحافظة، العنوان، رقم التواصل، مكان التوصيل).',
    'chatbot.cartExplanation4':
      'بعد إدخال العنوان والضغط على "إكمال الشراء"، سيتم خصم المبلغ من رصيد المحفظة تلقائياً.',
    'chatbot.cartExplanation5':
      'ستظهر لك فاتورة الشراء مع جميع التفاصيل، ويمكنك تحميلها كملف HTML.',
    'chatbot.goToCart': 'انتقل إلى صفحة السلة',
    'chatbot.profile': 'البروفايل',
    'chatbot.profileExplanation1': 'صفحة البروفايل تتيح لك إدارة جميع بياناتك الشخصية.',
    'chatbot.profileExplanation2':
      'يمكنك تعديل: الاسم الأول، الاسم الأوسط، الاسم الأخير، ورقم الهاتف.',
    'chatbot.profileExplanation3': 'البريد الإلكتروني والنيك نيم غير قابلين للتعديل لأسباب أمنية.',
    'chatbot.profileExplanation4':
      'يمكنك رفع صورة بروفايل شخصية، وسيتم عرضها في جميع أنحاء الموقع.',
    'chatbot.profileExplanation5':
      'يمكنك الوصول إلى صفحة البروفايل من أيقونة البروفايل في Navbar أو من خلال الزر أدناه.',
    'chatbot.goToProfile': 'الذهاب إلى البروفايل',
    'customerService.title': 'خدمة العملاء',
    'customerService.category': 'الفئة',
    'customerService.subject': 'الموضوع',
    'customerService.message': 'الرسالة',
    'customerService.submit': 'إرسال',
    'customerService.cancel': 'إلغاء',
    'customerService.successMessage': 'تم إرسال رسالتك بنجاح! سيتم الرد عليك قريباً.',
    'customerService.errorMessage': 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.',
    'customerService.deleteAccount': 'حذف حساب',
    'customerService.depositIssue': 'مشكلة إيداع',
    'customerService.productIssue': 'مشكلة في المنتج',
    'customerService.technicalIssue': 'مشكلة تقنية',
    'customerService.generalInquiry': 'استفسار عام',
    'customerService.complaint': 'شكوى',
    'admin.customerFeedback.title': 'آراء العملاء',
    'admin.customerFeedback.category': 'الفئة',
    'admin.customerFeedback.subject': 'الموضوع',
    'admin.customerFeedback.message': 'الرسالة',
    'admin.customerFeedback.status': 'الحالة',
    'admin.customerFeedback.createdAt': 'تاريخ الإنشاء',
    'admin.customerFeedback.actions': 'الإجراءات',
    'admin.customerFeedback.respond': 'الرد',
    'admin.customerFeedback.adminResponse': 'رد الأدمن',
    'admin.customerFeedback.pending': 'قيد الانتظار',
    'admin.customerFeedback.inProgress': 'قيد المعالجة',
    'admin.customerFeedback.resolved': 'تم الحل',
    'admin.customerFeedback.closed': 'مغلق',
    'admin.customerFeedback.noTickets': 'لا توجد رسائل',
    'admin.customerFeedback.back': 'العودة',
    'admin.customerFeedback.delete': 'حذف',
    'admin.jobApplications.title': 'طلبات التوظيف',
    'admin.jobApplications.category': 'الوظيفة',
    'admin.jobApplications.backupEmail': 'البريد الإلكتروني الاحتياطي',
    'admin.jobApplications.whatsappPhone': 'رقم الواتساب',
    'admin.jobApplications.linkedinUrl': 'رابط LinkedIn',
    'admin.jobApplications.githubUrl': 'رابط GitHub',
    'admin.jobApplications.facebookUrl': 'رابط Facebook',
    'admin.jobApplications.cvFile': 'ملف السيرة الذاتية',
    'admin.jobApplications.experience': 'الخبرات والمهارات',
    'admin.jobApplications.status': 'الحالة',
    'admin.jobApplications.createdAt': 'تاريخ الإنشاء',
    'admin.jobApplications.actions': 'الإجراءات',
    'admin.jobApplications.respond': 'الرد',
    'admin.jobApplications.adminNote': 'ملاحظة الأدمن',
    'admin.jobApplications.accept': 'قبول',
    'admin.jobApplications.reject': 'رفض',
    'admin.jobApplications.delete': 'حذف',
    'admin.jobApplications.pending': 'قيد الانتظار',
    'admin.jobApplications.accepted': 'مقبول',
    'admin.jobApplications.rejected': 'مرفوض',
    'admin.jobApplications.noApplications': 'لا توجد طلبات',
    'admin.jobApplications.back': 'العودة',
    'admin.jobApplications.submit': 'إرسال',
    'admin.jobApplications.cancel': 'إلغاء',
    'sellProduct.title': 'اعرض منتجك',
    'sellProduct.productName': 'اسم المنتج',
    'sellProduct.mainImage': 'الصورة الرئيسية',
    'sellProduct.additionalImages': 'الصور الفرعية',
    'sellProduct.startingPrice': 'السعر المبدئي',
    'sellProduct.submit': 'إرسال',
    'sellProduct.cancel': 'إلغاء',
    'sellProduct.successMessage': 'تم إرسال طلبك بنجاح! سيتم مراجعته من قبل الأدمن قريباً.',
    'sellProduct.errorMessage': 'حدث خطأ أثناء إرسال المنتج. يرجى المحاولة مرة أخرى.',
    'sellProduct.selectMainImage': 'اختر الصورة الرئيسية',
    'sellProduct.removeMainImage': 'إزالة الصورة الرئيسية',
    'sellProduct.selectAdditionalImages': 'اختر صور إضافية',
    'sellProduct.removeAdditionalImage': 'إزالة الصورة',
    'sellProduct.invalidPrice': 'السعر يجب أن يكون أكبر من 0',
    'sellProduct.maxImages': 'الحد الأقصى 9 صور فرعية',
    'admin.auctionProducts.title': 'منتجات المزاد',
    'admin.auctionProducts.startingPrice': 'السعر المبدئي',
    'admin.auctionProducts.status': 'الحالة',
    'admin.auctionProducts.createdAt': 'تاريخ الإنشاء',
    'admin.auctionProducts.actions': 'الإجراءات',
    'admin.auctionProducts.approve': 'موافقة',
    'admin.auctionProducts.reject': 'رفض',
    'admin.auctionProducts.adminNote': 'ملاحظة الأدمن',
    'admin.auctionProducts.pending': 'قيد الانتظار',
    'admin.auctionProducts.approved': 'موافق عليه',
    'admin.auctionProducts.rejected': 'مرفوض',
    'admin.auctionProducts.noProducts': 'لا توجد منتجات',
    'admin.auctionProducts.back': 'العودة',
    'admin.auctionProducts.delete': 'حذف',
    'admin.auctionProducts.sendResponse': 'إرسال',
    'admin.auctionProducts.cancel': 'إلغاء',
    'admin.auctionProducts.mainImage': 'الصورة الرئيسية',
    'admin.auctionProducts.additionalImages': 'الصور الفرعية',
    'joinUs.title': 'انضم إلينا',
    'joinUs.category': 'الوظيفة',
    'joinUs.backupEmail': 'البريد الإلكتروني الاحتياطي',
    'joinUs.whatsappPhone': 'رقم الواتساب',
    'joinUs.linkedinUrl': 'رابط LinkedIn',
    'joinUs.githubUrl': 'رابط GitHub',
    'joinUs.facebookUrl': 'رابط Facebook',
    'joinUs.cvFile': 'ملف السيرة الذاتية (PDF)',
    'joinUs.experience': 'الخبرات والمهارات',
    'joinUs.submit': 'إرسال الطلب',
    'joinUs.cancel': 'إلغاء',
    'joinUs.successMessage': 'تم إرسال طلبك بنجاح! سنتواصل معك قريباً.',
    'joinUs.errorMessage': 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.',
    'joinUs.selectFile': 'اختر ملف PDF',
    'joinUs.removeFile': 'إزالة الملف',
    'joinUs.invalidEmail': 'البريد الإلكتروني غير صحيح',
    'joinUs.invalidUrl': 'الرابط غير صحيح',
    'joinUs.minLength': 'يجب أن يكون النص على الأقل 20 حرفاً',
    'joinUs.frontendDeveloper': 'مطور Frontend',
    'joinUs.backendDeveloper': 'مطور Backend',
    'joinUs.fullStackDeveloper': 'مطور Full Stack',
    'joinUs.uiUxDesigner': 'مصمم UI/UX',
    'joinUs.graphicDesigner': 'مصمم جرافيك',
    'joinUs.marketingSpecialist': 'أخصائي تسويق',
    'joinUs.contentWriter': 'كاتب محتوى',
    'joinUs.dataAnalyst': 'محلل بيانات',
    'joinUs.projectManager': 'مدير مشاريع',
    'joinUs.other': 'أخرى',
    'usersManagement.refreshChart': 'تحديث الرسم البياني',
    'usersManagement.refreshingChart': 'جاري التحديث...',
    'chatbot.yes': 'نعم',
    'chatbot.no': 'لا',

    // Navbar
    'navbar.home': 'الرئيسية',
    'navbar.auctions': 'المزادات',
    'navbar.joinUs': 'انضم الينا',
    'navbar.customerService': 'خدمة العملاء',
    'navbar.sellProduct': 'اعرض منتجك',
    'navbar.categories': 'الفئات',
    'navbar.about': 'من نحن',
    'navbar.contact': 'اتصل بنا',
    'navbar.card': 'الكارد',
    'navbar.profile': 'البروفايل',
    'navbar.statistics': 'الإحصائيات',
    'navbar.wallet': 'المحفظة',
    'navbar.walletAddFunds': 'إضافة رصيد',
    'navbar.walletInstaPay': 'انستا باي',
    'navbar.walletAmount': 'المبلغ',
    'navbar.walletPhoneNumber': 'رقم الهاتف',
    'navbar.walletDepositImage': 'صورة الإيداع',
    'navbar.walletSubmitRequest': 'إرسال الطلب',
    'navbar.messages': 'الرسائل',
    'navbar.noMessages': 'لا توجد رسائل',
    'navbar.requestApproved': 'تمت الموافقة على طلب الإيداع',
    'navbar.requestRejected': 'تم رفض طلب الإيداع',
    'navbar.requestPending': 'طلب الإيداع قيد المراجعة',
    'navbar.walletPrivacyPolicy': 'لقد قرأت سياسات الخصوصية',
    'navbar.walletReviewingData': 'جاري مراجعة البيانات...',
    'navbar.walletAddFundsSuccess': 'تم إضافة الرصيد بنجاح!',
    'navbar.walletOK': 'موافق',
    'navbar.walletCancel': 'إلغاء',
    'navbar.login': 'تسجيل الدخول',
    'navbar.register': 'إنشاء حساب',
    'navbar.logout': 'تسجيل الخروج',

    // Admin Money Requests
    'admin.moneyRequests.title': 'طلبات الإيداع',
    'admin.moneyRequests.amount': 'المبلغ',
    'admin.moneyRequests.user': 'المستخدم',
    'admin.moneyRequests.phoneNumber': 'رقم الهاتف',
    'admin.moneyRequests.status': 'الحالة',
    'admin.moneyRequests.depositImage': 'صورة الإيداع',
    'admin.moneyRequests.createdAt': 'تاريخ الإنشاء',
    'admin.moneyRequests.actions': 'الإجراءات',
    'admin.moneyRequests.approve': 'موافقة',
    'admin.moneyRequests.reject': 'رفض',
    'admin.moneyRequests.reviewNote': 'ملاحظة المراجعة',
    'admin.moneyRequests.pending': 'قيد المراجعة',
    'admin.moneyRequests.approved': 'تمت الموافقة',
    'admin.moneyRequests.rejected': 'تم الرفض',
    'admin.moneyRequests.noRequests': 'لا توجد طلبات',
    'admin.moneyRequests.back': 'رجوع',
    'admin.moneyRequests.delete': 'حذف',
    'admin.moneyRequests.deleteRequestConfirm': 'هل أنت متأكد من حذف هذا الطلب؟',

    // Admin Send Messages
    'admin.sendMessages.title': 'إرسال الرسائل وإدارة المبيعات',
    'admin.sendMessages.selectUser': 'اختر المستخدم',
    'admin.sendMessages.searchUser': 'ابحث عن المستخدم...',
    'admin.sendMessages.messageSubject': 'عنوان الرسالة',
    'admin.sendMessages.messageText': 'نص الرسالة',
    'admin.sendMessages.enterSubject': 'أدخل عنوان الرسالة...',
    'admin.sendMessages.enterMessage': 'أدخل نص الرسالة...',
    'admin.sendMessages.sendMessage': 'إرسال الرسالة',
    'admin.sendMessages.sending': 'جاري الإرسال...',
    'admin.sendMessages.success': 'تم إرسال الرسالة بنجاح',
    'admin.sendMessages.error': 'حدث خطأ أثناء إرسال الرسالة',
    'admin.sendMessages.back': 'رجوع',
    'admin.sendMessages.cancel': 'إلغاء',

    // Home Page
    'home.hero.title': 'Mazzady',
    'home.hero.subtitle': 'منصة المزادات الإلكترونية الرائدة - اكتشف أفضل الصفقات والعروض الحصرية',
    'home.howItWorks.title': 'كيف يعمل التطبيق',
    'home.howItWorks.step1.title': 'سجل حسابك',
    'home.howItWorks.step1.description':
      'أنشئ حسابك بسهولة في دقائق قليلة. فقط املأ بياناتك الأساسية وتحقق من بريدك الإلكتروني وابدأ رحلتك معنا.',
    'home.howItWorks.step2.title': 'شارك في المزادات',
    'home.howItWorks.step2.description':
      'تصفح المزادات الحية وشارك في المزايدة على المنتجات التي تهمك. اربح أفضل الصفقات بأسعار منافسة.',
    'home.featuredAuctions.title': 'أبرز المزادات الأونلاين',
    'home.stats.title': 'إحصائيات المنصة',
    'home.stats.totalUsers': 'المستخدمين المسجلين',
    'home.stats.totalProducts': 'المنتجات المعروضة',
    'home.stats.endedAuctions': 'المزادات المنتهية',
    'home.projectJourney.title': 'كيف تم العمل على المشروع',
    'home.projectJourney.subtitle': 'رحلة تطوير Mazzady من الفكرة إلى الواقع',
    'home.projectJourney.point1.title': 'التخطيط والتصميم',
    'home.projectJourney.point1.content':
      'بدأ المشروع بمرحلة التخطيط الشاملة حيث تم تصميم البنية التحتية والواجهات وتحديد المميزات الأساسية. تم استخدام أدوات تصميم حديثة لإنشاء تجربة مستخدم احترافية.',
    'home.projectJourney.point2.title': 'تطوير Backend',
    'home.projectJourney.point2.content':
      'تم بناء الـ Backend باستخدام NestJS مع MongoDB لضمان أداء عالي وقابلية التوسع. تم تطبيق معمارية RESTful API مع نظام مصادقة آمن.',
    'home.projectJourney.point3.title': 'تطوير Frontend',
    'home.projectJourney.point3.content':
      'تم بناء الواجهة الأمامية باستخدام Angular مع Standalone Components وSignals لضمان أداء عالي وتجربة مستخدم سلسة. تم تطبيق تصميم متجاوب لجميع الأجهزة.',
    'home.projectJourney.point4.title': 'نظام المصادقة',
    'home.projectJourney.point4.content':
      'تم تطوير نظام مصادقة متقدم مع التحقق من البريد الإلكتروني، OAuth (Google & Facebook)، ونظام Remember Me. تم استخدام bcrypt لتشفير كلمات المرور.',
    'home.projectJourney.point5.title': 'نظام المزادات',
    'home.projectJourney.point5.content':
      'تم بناء نظام مزادات متكامل مع Timer حي، نظام مزايدة، وإدارة شاملة للمزادات. يتم تحديث الحالات تلقائياً وإنشاء المنتجات عند انتهاء المزادات.',
    'home.projectJourney.point6.title': 'نظام الرسائل والإشعارات',
    'home.projectJourney.point6.content':
      'تم تطوير نظام رسائل شامل مع Floating Menu وNavbar Messages. يتم تحديث الرسائل تلقائياً كل 30 ثانية مع إمكانية الحذف بعد الرد.',
    'home.projectJourney.point7.title': 'نظام الإدارة',
    'home.projectJourney.point7.content':
      'تم بناء لوحة تحكم متكاملة للأدمن مع إدارة المستخدمين، المنتجات، المزادات، وطلبات الإيداع. تم تطبيق نظام Guard لحماية الصفحات.',
    'home.projectJourney.point8.title': 'الترجمة والثيم',
    'home.projectJourney.point8.content':
      'تم تطوير نظام ترجمة كامل (عربي/إنجليزي) مع RTL/LTR switching تلقائي. تم إضافة نظام ثيم (Dark/Light Mode) مع حفظ التفضيلات.',
    'home.projectJourney.point9.title': 'التحسينات والأداء',
    'home.projectJourney.point9.content':
      'تم تحسين الأداء بشكل شامل مع lazy loading، code splitting، وoptimized animations. تم استخدام CSS containment وtransform-only animations لضمان أداء عالي.',
    'home.projectJourney.point10.title': 'الاختبار والتطوير',
    'home.projectJourney.point10.content':
      'تم اختبار جميع المميزات بشكل شامل مع معالجة الأخطاء وإصلاح memory leaks. تم تطبيق best practices في جميع أنحاء المشروع.',
    'home.projectJourney.modal.close': 'إغلاق',
    'home.contact.title': 'تواصل معنا للعمل',
    'home.contact.subtitle': 'هل تريد أن تكون جزءاً من فريق Mazzady؟ تواصل معنا الآن!',
    'home.contact.button': 'تواصل معنا',

    // Auctions
    'auctions.title': 'المزادات',
    'auctions.searchPlaceholder': 'ابحث عن منتج أو بائع...',
    'auctions.category': 'الفئة',
    'auctions.allCategories': 'جميع الفئات',
    'auctions.filters': 'الفلاتر',
    'auctions.priceRange': 'نطاق السعر',
    'auctions.sortBy': 'ترتيب حسب',
    'auctions.newest': 'الأحدث',
    'auctions.oldest': 'الأقدم',
    'auctions.priceLowToHigh': 'السعر: من الأقل للأعلى',
    'auctions.priceHighToLow': 'السعر: من الأعلى للأقل',
    'auctions.noProducts': 'لا توجد منتجات متاحة',
    'auctions.startingPrice': 'السعر المبدئي',
    'auctions.currentBid': 'السعر الحالي',
    'auctions.viewDetails': 'عرض التفاصيل',
    'auctions.applyFilters': 'تطبيق الفلاتر',
    'auctions.clearFilters': 'مسح الفلاتر',
    'auctions.closeFilters': 'إغلاق الفلاتر',
    'auctions.categories.all': 'جميع الفئات',
    'auctions.categories.electronics': 'إلكترونيات',
    'auctions.categories.fashion': 'أزياء',
    'auctions.categories.home': 'منزل',
    'auctions.categories.vehicles': 'مركبات',
    'auctions.categories.art': 'فنون',
    'auctions.categories.jewelry': 'مجوهرات',
    'auctions.categories.books': 'كتب',
    'auctions.categories.sports': 'رياضة',
    'auctions.categories.other': 'أخرى',
    'auctions.sellers': 'البائعين',
    'auctions.sellersModal.title': 'جميع البائعين',
    'auctions.sellersModal.totalAuctions': 'عدد المنتجات',
    'auctions.sellersModal.likes': 'الإعجابات',
    'auctions.sellersModal.rating': 'التقييم',
    'auctions.sellersModal.noSellers': 'لا يوجد بائعين',
    'auctions.sellersModal.close': 'إغلاق',

    // Footer
    'footer.about': 'من نحن',
    'footer.quickLinks': 'روابط سريعة',
    'footer.legal': 'قانوني',
    'footer.contact': 'اتصل بنا',
    'footer.followUs': 'تابعنا',
    'footer.allRightsReserved': 'جميع الحقوق محفوظة © 2026 Mazzady',

    // Registration
    'register.welcome': 'مرحباً بك في Mazzady',
    'register.personalInfo': 'المعلومات الشخصية',
    'register.fullName': 'الاسم الكامل',
    'register.firstName': 'الاسم الأول',
    'register.middleName': 'الاسم الأوسط',
    'register.lastName': 'الاسم الأخير',
    'register.nickname': 'النيك نيم',
    'register.phoneNumber': 'رقم التليفون المصري',
    'register.nationalId': 'الرقم القومي',
    'register.email': 'البريد الإلكتروني',
    'register.verifyEmail': 'التحقق من البريد الإلكتروني',
    'register.verificationCode': 'كود التحقق',
    'register.password': 'كلمة المرور',
    'register.confirmPassword': 'تأكيد كلمة المرور',
    'register.reviewInfo': 'مراجعة المعلومات',
    'register.success': 'تم التسجيل بنجاح!',
    'register.successMessage': 'تم التحقق من بياناتك وإنشاء حسابك بنجاح.',
    'register.redirecting': 'جاري التوجيه إلى صفحة تسجيل الدخول خلال',
    'register.goToLogin': 'الانتقال إلى تسجيل الدخول الآن',

    // Login
    'login.welcome': 'مرحباً بك في Mazzady',
    'login.welcomeBack': 'مرحباً بعودتك',
    'login.email': 'البريد الإلكتروني',
    'login.password': 'كلمة المرور',
    'login.rememberMe': 'تذكرني',
    'login.rememberMeInfo': 'ستبقى جلستك نشطة لمدة 7 أيام فقط عند تفعيل تذكرني.',
    'login.reviewInfo': 'مراجعة المعلومات',
    'login.verifyCode': 'كود التحقق',
    'login.welcomeBackTitle': 'مرحباً بعودتك!',
    'login.welcomeBackMessage': 'تم تسجيل الدخول بنجاح',
    'login.redirecting': 'جاري التوجيه إلى الصفحة الرئيسية خلال',
    'login.verifyAndLogin': 'التحقق وتسجيل الدخول',
    'login.verifying': 'جاري التحقق...',
    'login.loggingIn': 'جاري تسجيل الدخول...',

    // Validation Messages
    'validation.required': 'هذا الحقل مطلوب',
    'validation.email': 'يرجى إدخال بريد إلكتروني صحيح',
    'validation.minLength': 'يجب أن يكون على الأقل {min} أحرف',
    'validation.passwordMismatch': 'كلمات المرور غير متطابقة',
    'validation.invalidPhone': 'يرجى إدخال رقم تليفون مصري صحيح',
    'validation.invalidNationalId': 'يرجى إدخال رقم قومي مصري صحيح (14 رقم)',
    'validation.nationalIdExists': 'هذا الرقم القومي مسجل بالفعل',
    'validation.emailExists': 'هذا البريد الإلكتروني مسجل بالفعل',
    'validation.nicknameExists': 'هذا النيك نيم موجود بالفعل',
    'validation.phoneExists': 'هذا الرقم مسجل بالفعل',
    'validation.weakPassword': 'كلمة مرور ضعيفة',
    'validation.mediumPassword': 'قوة متوسطة',
    'validation.strongPassword': 'كلمة مرور قوية',
    'validation.nameRequired': 'جميع حقول الاسم مطلوبة (الحد الأدنى حرفين لكل حقل)',
    'validation.nicknameRequired': 'النيك نيم مطلوب (الحد الأدنى 3 أحرف)',
    'validation.passwordMinLength': 'كلمة المرور يجب أن تكون على الأقل 6 أحرف',
    'validation.verificationCode': 'يرجى إدخال كود التحقق المكون من 6 أرقام',
    'validation.verificationCode6Digits': 'يرجى إدخال كود التحقق المكون من 6 أرقام',

    // Errors
    'error.invalidEmail': 'يرجى إدخال بريد إلكتروني صحيح',
    'error.invalidCode': 'كود التحقق غير صحيح',
    'error.codeExpired': 'انتهت صلاحية كود التحقق',
    'error.registrationFailed': 'فشل التسجيل',
    'error.loginFailed': 'فشل تسجيل الدخول',
  },
  en: {
    // Common
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',

    // Floating Menu
    'menu.chatBot': 'Chat Bot',
    'menu.privacyPolicy': 'Privacy Policy',
    'menu.returnPolicy': 'Return Policy',
    'menu.sitePolicy': 'Site Policy',
    'menu.copyright': 'Copyright',
    'menu.quickReference': 'Quick Reference',
    'menu.quickReferenceContent':
      'Quick reference for using Mazzady platform:\n\n• Browse live auctions\n• Bid on products\n• Follow favorite auctions\n• Manage your account\n• Contact sellers\n• Browse different categories',
    'menu.copyrightContent':
      '© 2026 Mazzady. All rights reserved.\n\nThis website and its content are protected by copyright. No part of this site may be copied or distributed without written permission from Mazzady.',
    'menu.sitePolicyContent':
      'Site Usage Policy:\n\n• Users must comply with terms of use\n• Illegal use of the site is prohibited\n• Mazzady reserves the right to modify policies at any time\n• Users are responsible for their account security\n• Posting offensive or inappropriate content is prohibited',
    'menu.returnPolicyContent':
      'Return and Exchange Policy:\n\n• Products can be returned within 14 days of receipt\n• Product must be in original condition\n• Customized products are not returnable\n• Refund will be processed within 5-7 business days\n• For inquiries, please contact customer service',
    'menu.privacyPolicyContent':
      'Privacy Policy:\n\n• We strictly protect your personal information\n• We do not share your data with third parties\n• We use encryption to protect your data\n• You can request deletion of your data at any time\n• We comply with international data protection standards',
    'menu.close': 'Close',
    'menu.changeLanguage': 'Change Language',
    'menu.changeTheme': 'Change Theme',
    'menu.themePersistent': 'Keep Theme Persistent',
    'menu.themeDark': 'Dark',
    'menu.themeLight': 'Light',
    'menu.changeScheme': 'Change Scheme',
    'menu.schemeDefault': 'Classic',
    'menu.schemeBasic': 'Basic',
    'menu.messages': 'Messages',
    'menu.noMessages': 'No messages',
    'menu.requestApproved': 'Approved',
    'menu.requestRejected': 'Rejected',
    'menu.requestPending': 'Pending',
    'menu.amount': 'Amount',
    'menu.date': 'Date',
    'menu.delete': 'Delete',
    'menu.deleteMessageConfirm': 'Are you sure you want to delete this message?',

    // Profile
    'profile.title': 'Profile',
    'profile.firstName': 'First Name',
    'profile.middleName': 'Middle Name',
    'profile.lastName': 'Last Name',
    'profile.email': 'Email',
    'profile.nickname': 'Nickname',
    'profile.phone': 'Phone Number',
    'profile.nationalId': 'National ID',
    'profile.walletBalance': 'Wallet Balance',
    'profile.profileImage': 'Profile Image',
    'profile.changeImage': 'Change Image',
    'profile.save': 'Save',
    'profile.cancel': 'Cancel',
    'profile.back': 'Back',
    'profile.loading': 'Loading...',
    'profile.saving': 'Saving...',
    'profile.saveSuccess': 'Changes saved successfully',
    'profile.saveError': 'Error saving changes',
    'profile.required': 'This field is required',
    'profile.invalidPhone': 'Invalid phone number',
    'profile.minLength': 'Must be at least 2 characters',

    // Chatbot
    'chatbot.welcome': "Hello! I'm Mazzady Assistant. How can I help you today?",
    'chatbot.login': 'Login',
    'chatbot.register': 'Create New Account',
    'chatbot.backToMenu': 'Back to Menu',
    'chatbot.loginStep1': 'Step 1: Enter your email address',
    'chatbot.loginStep2': 'Step 2: Enter your password and choose "Remember Me"',
    'chatbot.loginStep3': 'Step 3: Review your information',
    'chatbot.loginStep4': 'Step 4: Enter verification code (6 digits)',
    'chatbot.loginStep5': 'Step 5: Welcome Back! You will be redirected automatically',
    'chatbot.goToLogin': 'Go to Login Page',
    'chatbot.registerStep1': 'Step 1: Enter your full name (First, Middle, Last) and Nickname',
    'chatbot.registerStep2': 'Step 2: Enter your Egyptian phone number',
    'chatbot.registerStep3':
      'Step 3: Enter your email (verification code will be sent automatically)',
    'chatbot.registerStep4': 'Step 4: Enter verification code (6 digits, valid for 10 minutes)',
    'chatbot.registerStep5': 'Step 5: Enter password and confirm it',
    'chatbot.registerStep6': 'Step 6: Review all your information',
    'chatbot.registerStep7':
      'Step 7: Registration successful! You will be redirected automatically',
    'chatbot.goToRegister': 'Go to Registration Page',
    'chatbot.alreadyRegistered': 'You are already registered! You can use your current account.',
    'chatbot.theme': 'Change Theme',
    'chatbot.themeExplanation1':
      'The theme button allows you to switch between Dark mode and Light mode.',
    'chatbot.themeExplanation2':
      'When you enable "Keep Theme Persistent", your preference will be saved and the theme will remain as you chose even after reopening the site.',
    'chatbot.themeExplanation3':
      'You can find the theme button in the Floating Menu at the bottom left of the page.',
    'chatbot.themeExplanation4':
      'Dark mode is suitable for use in low light, while Light mode is suitable for use in bright light.',
    'chatbot.themeExplanation5':
      'All colors change with the theme except the gold color and validation message colors (green and red).',
    'chatbot.goToTheme': 'Go to Menu to Change Theme',
    'chatbot.showOptions': 'Show Options',
    'chatbot.hideOptions': 'Hide Options',
    'chatbot.about': 'About Chatbot',
    'chatbot.aboutExplanation1':
      "Hello! I am Mazzady's smart assistant, and I am here to help you understand and use the site easily.",
    'chatbot.aboutExplanation2':
      'I can help you with: explaining login steps, explaining how to create a new account, explaining how to change the theme (Dark/Light Mode), and answering your questions about the site.',
    'chatbot.aboutExplanation3':
      'You can drag me from the Header anywhere on the screen. In Arabic, I only move on the right side of the screen for ease of use.',
    'chatbot.aboutExplanation4':
      'I am designed to be easy to use - just choose from the available buttons and I will explain everything step by step.',
    'chatbot.aboutExplanation5':
      'If you have any questions or need help, just choose one of the options from the menu and I will be happy to help you!',
    'chatbot.home': 'Home Page',
    'chatbot.homeExplanation1':
      "Mazzady's home page is the starting point for your journey in the world of online auctions.",
    'chatbot.homeExplanation2':
      'The page is designed to be an attractive and easy-to-use interface, starting with a Hero Section with animated images showcasing the best products and auctions.',
    'chatbot.homeExplanation3':
      'Then comes the "How It Works" section that explains step by step how to participate in auctions and benefit from the services.',
    'chatbot.homeExplanation4':
      'The page is designed to be fast and smooth, with full support for Arabic and English, and compatible with dark and light themes.',
    'chatbot.admin': 'About Admin Panel',
    'chatbot.adminExplanation1':
      'The Admin Panel is where administrators manage all aspects of the Mazzady platform.',
    'chatbot.adminExplanation2':
      'From here, admins can manage users, products, auctions, orders, and general platform settings.',
    'chatbot.adminExplanation3':
      'The Admin Panel is designed to be secure and easy to use, with a professional interface that provides all the tools needed for effective management.',
    'chatbot.adminExplanation4':
      'All operations in the Admin Panel are protected and secured, and require special admin login only.',
    'chatbot.adminChangeLanguage': 'Change Language',
    'chatbot.adminChangeLanguageQuestion': 'Do you want to change the language?',
    'chatbot.adminChangeTheme': 'Change Theme',
    'chatbot.adminChangeThemeQuestion': 'Do you want to change the theme?',
    'chatbot.adminUsersManagement': 'Users Management',
    'chatbot.adminUsersManagementExplanation1':
      'The Users Management page allows you to view and manage all registered users on the platform.',
    'chatbot.adminUsersManagementExplanation2':
      'You can see comprehensive statistics: total users, online users, offline users, and total visits this month.',
    'chatbot.adminUsersManagementExplanation3':
      "The chart displays each user's visit percentage this month and updates automatically with each new visit.",
    'chatbot.adminUsersManagementExplanation4':
      'You can also delete any user from the table, with the ability to view all their data: name, email, nickname, phone number, and status (online/offline).',
    'chatbot.adminEditHomePage': 'Edit Home Page',
    'chatbot.adminEditHomePageExplanation1':
      'The Edit Home Page allows you to manage images displayed on the Home page.',
    'chatbot.adminEditHomePageExplanation2':
      'You can add Hero Section images (carousel) that appear at the top of the page, and you can add up to 7 images.',
    'chatbot.adminEditHomePageExplanation3':
      'You can also add How It Works Section images that appear in the "How the Application Works" section.',
    'chatbot.adminEditHomePageExplanation4':
      'After adding images, click "Save Changes" and they will be automatically uploaded to the server and displayed on the Home page immediately.',
    'chatbot.adminMoneyRequests': 'Money Requests',
    'chatbot.adminMoneyRequestsExplanation1':
      'The Money Requests page allows you to review and manage all deposit requests from users.',
    'chatbot.adminMoneyRequestsExplanation2':
      'You can see details of each request: user, amount, phone number, deposit image, and date.',
    'chatbot.adminMoneyRequestsExplanation3':
      "You can approve the request (the amount will be automatically added to the user's wallet balance) or reject it with a note.",
    'chatbot.adminMoneyRequestsExplanation4':
      'You can also delete any request from the list. All requests are sorted by date (newest first).',
    'chatbot.adminCustomerFeedback': 'Customer Feedback',
    'chatbot.adminCustomerFeedbackExplanation1':
      'The Customer Feedback page allows you to review and manage all customer service messages from users.',
    'chatbot.adminCustomerFeedbackExplanation2':
      'You can see details of each message: user, category, subject, message, and status.',
    'chatbot.adminCustomerFeedbackExplanation3':
      'You can respond to messages and update their status (pending, in progress, resolved, closed).',
    'chatbot.adminCustomerFeedbackExplanation4':
      'Your response will be sent to the user in their Messages page in the Floating Menu.',
    'chatbot.goToCustomerFeedback': 'Go to Customer Feedback',
    'chatbot.customerService': 'Customer Service',
    'chatbot.customerServiceExplanation1':
      'The Customer Service page allows you to send messages for help and technical support.',
    'chatbot.customerServiceExplanation2':
      'You can choose the appropriate category for your issue: delete account, deposit issue, product issue, technical issue, general inquiry, or complaint.',
    'chatbot.customerServiceExplanation3':
      'Write a clear subject and description of your problem, and our support team will respond to you as soon as possible.',
    'chatbot.customerServiceExplanation4':
      'The admin response will be sent to your Messages page in the Floating Menu.',
    'chatbot.goToCustomerService': 'Go to Customer Service',
    'chatbot.joinUs': 'Join Us',
    'chatbot.joinUsExplanation1':
      'You can apply to join the Mazzady team through the "Join Us" page.',
    'chatbot.joinUsExplanation2':
      'You will need to select the appropriate job position from the available list.',
    'chatbot.joinUsExplanation3': 'Add your personal information, social media links, and CV file.',
    'chatbot.joinUsExplanation4':
      'After submitting your application, we will review it and contact you soon.',
    'chatbot.goToJoinUs': 'Go to Join Us Page',
    'chatbot.auctions': 'Auctions',
    'chatbot.auctionsExplanation1':
      'Auctions are a platform for displaying products and bidding on them. You can browse active auctions and bid on products that interest you.',
    'chatbot.auctionsExplanation2':
      'Bidding Time: You can bid at any time during an active auction. Your bid must be at least the "minimum bid increment" higher than the current price set for each auction.',
    'chatbot.auctionsExplanation3':
      'After Winning the Auction: When the auction ends, if you have the highest bid, the amount will be automatically deducted from your wallet balance. You must have sufficient balance in your wallet before bidding.',
    'chatbot.auctionsExplanation4':
      'Important Tips: You should be aware of the auction end time - you can see the countdown timer in each auction. Make sure you have sufficient balance in your wallet before bidding. Bids are binding - they cannot be canceled after confirmation.',
    'chatbot.auctionsExplanation5':
      'You can follow favorite auctions, watch all bids in real-time, and see who currently has the highest bid.',
    'chatbot.goToAuctions': 'Go to Auctions Page',
    'chatbot.adminJobApplications': 'Job Applications',
    'chatbot.adminJobApplicationsExplanation1':
      'You can view and manage all job applications from the "Job Applications" page.',
    'chatbot.adminJobApplicationsExplanation2':
      'You will see applicant information, CV files, and experience.',
    'chatbot.adminJobApplicationsExplanation3':
      'You can accept or reject applications with an admin note.',
    'chatbot.adminJobApplicationsExplanation4':
      'You can also delete applications after acceptance or rejection.',
    'chatbot.goToJobApplications': 'Go to Job Applications Page',
    'chatbot.sellProduct': 'Sell Your Product',
    'chatbot.sellProductExplanation1':
      'You can list your product for auction through the "Sell Your Product" page.',
    'chatbot.sellProductExplanation2':
      'You will need to upload a main product image and up to 9 additional images.',
    'chatbot.sellProductExplanation3':
      'Enter the starting price for the product you want to sell in the auction.',
    'chatbot.sellProductExplanation4':
      'After submitting your request, it will be reviewed by the admin. Upon approval, we will contact you soon.',
    'chatbot.goToSellProduct': 'Go to Sell Your Product Page',
    'chatbot.adminAuctionProducts': 'Auction Products',
    'chatbot.adminAuctionProductsExplanation1':
      'You can view and manage all auction products from the "Auction Products" page.',
    'chatbot.adminAuctionProductsExplanation2':
      'You will see user information, images, and starting price for each product.',
    'chatbot.adminAuctionProductsExplanation3':
      'You can approve the product or reject it with an admin note in case of rejection.',
    'chatbot.adminAuctionProductsExplanation4':
      'You can also delete products after approval or rejection.',
    'chatbot.goToAuctionProducts': 'Go to Auction Products Page',
    'chatbot.adminSendMessages': 'Send Messages',
    'chatbot.adminSendMessagesExplanation1':
      'The Send Messages page allows you to send messages to any registered user on the site.',
    'chatbot.adminSendMessagesExplanation2':
      'You can search for users by username, email, or nickname.',
    'chatbot.adminSendMessagesExplanation3':
      'You can write the message subject and text, then send it directly to the user.',
    'chatbot.adminSendMessagesExplanation4':
      'The message will be sent to the user and will appear in their Messages page in the Floating Menu.',
    'chatbot.goToSendMessages': 'Go to Send Messages Page',
    'chatbot.adminAddProducts': 'Add Products to User',
    'chatbot.adminAddProductsExplanation1':
      'You can add new products to users through the "Send Messages & Sales Management" page.',
    'chatbot.adminAddProductsExplanation2':
      'You will need: product name, price, product image, and select the user who will receive the product.',
    'chatbot.adminAddProductsExplanation3':
      "After adding the product, it will be automatically added to the selected user's cart.",
    'chatbot.adminAddProductsExplanation4':
      'You can view all added products, and if a product has been paid, a "Paid" status will appear with a "Payment Details" button to view the address and all details.',
    'chatbot.goToAddProducts': 'Go to Products Management Page',
    'chatbot.adminAuctionsManagement': 'Auctions Management',
    'chatbot.adminAuctionsManagementExplanation1':
      'The Auctions Management page allows you to add and manage all auctions on the site.',
    'chatbot.adminAuctionsManagementExplanation2':
      'You can add new auctions with product details, starting price, duration, main image, and additional images.',
    'chatbot.adminAuctionsManagementExplanation3':
      'You can view all active and ended auctions, and see winners in ended auctions.',
    'chatbot.adminAuctionsManagementExplanation4':
      'You can delete auctions and view winner information in ended auctions.',
    'chatbot.goToAuctionsManagement': 'Go to Auctions Management Page',
    'chatbot.deposit': 'Add Funds',
    'chatbot.depositExplanation1': 'You can add funds to your wallet via InstaPay.',
    'chatbot.depositExplanation2':
      'Click on the wallet icon in the Navbar, then select "InstaPay" from the dropdown menu.',
    'chatbot.depositExplanation3':
      'Enter the required amount, and upload a deposit receipt image (must be a clear image).',
    'chatbot.depositExplanation4':
      'After submitting the request, it will be reviewed by the admin. Upon approval, the amount will be automatically added to your balance.',
    'chatbot.messages': 'Messages',
    'chatbot.messagesExplanation1':
      'You can view all approval/rejection messages for your deposit requests.',
    'chatbot.messagesExplanation2':
      'Messages appear in the Floating Menu (the floating menu at the bottom left of the page) or in the Navbar.',
    'chatbot.messagesExplanation3':
      'Each message contains: request status (approved/rejected), amount, date, and review note (if any).',
    'chatbot.messagesExplanation4':
      'Messages update automatically every 30 seconds, and you can open them anytime from the Floating Menu.',
    'chatbot.cart': 'Cart',
    'chatbot.cartExplanation1':
      'The cart allows you to view and manage products you have added for purchase.',
    'chatbot.cartExplanation2':
      'You can choose shipping method (ground/air) and insurance (10% of product price).',
    'chatbot.cartExplanation3':
      'When you click "Purchase", a modal will open to enter shipping address (country, governorate, address, contact phone, delivery location).',
    'chatbot.cartExplanation4':
      'After entering the address and clicking "Complete Purchase", the amount will be automatically deducted from your wallet balance.',
    'chatbot.cartExplanation5':
      'You will see a purchase invoice with all details, and you can download it as an HTML file.',
    'chatbot.goToCart': 'Go to Cart Page',
    'chatbot.profile': 'Profile',
    'chatbot.profileExplanation1':
      'The profile page allows you to manage all your personal information.',
    'chatbot.profileExplanation2':
      'You can edit: First Name, Middle Name, Last Name, and Phone Number.',
    'chatbot.profileExplanation3': 'Email and Nickname cannot be changed for security reasons.',
    'chatbot.profileExplanation4':
      'You can upload a profile picture, and it will be displayed throughout the site.',
    'chatbot.profileExplanation5':
      'You can access the profile page from the profile icon in the Navbar or through the button below.',
    'chatbot.goToProfile': 'Go to Profile',
    'customerService.title': 'Customer Service',
    'customerService.category': 'Category',
    'customerService.subject': 'Subject',
    'customerService.message': 'Message',
    'customerService.submit': 'Submit',
    'customerService.cancel': 'Cancel',
    'customerService.successMessage':
      'Your message has been sent successfully! We will respond to you soon.',
    'customerService.errorMessage':
      'An error occurred while sending the message. Please try again.',
    'customerService.deleteAccount': 'Delete Account',
    'customerService.depositIssue': 'Deposit Issue',
    'customerService.productIssue': 'Product Issue',
    'customerService.technicalIssue': 'Technical Issue',
    'customerService.generalInquiry': 'General Inquiry',
    'customerService.complaint': 'Complaint',
    'admin.customerFeedback.title': 'Customer Feedback',
    'admin.customerFeedback.category': 'Category',
    'admin.customerFeedback.subject': 'Subject',
    'admin.customerFeedback.message': 'Message',
    'admin.customerFeedback.status': 'Status',
    'admin.customerFeedback.createdAt': 'Created At',
    'admin.customerFeedback.actions': 'Actions',
    'admin.customerFeedback.respond': 'Respond',
    'admin.customerFeedback.adminResponse': 'Admin Response',
    'admin.customerFeedback.pending': 'Pending',
    'admin.customerFeedback.inProgress': 'In Progress',
    'admin.customerFeedback.resolved': 'Resolved',
    'admin.customerFeedback.closed': 'Closed',
    'admin.customerFeedback.noTickets': 'No tickets found',
    'admin.customerFeedback.back': 'Back',
    'admin.customerFeedback.delete': 'Delete',
    'admin.jobApplications.title': 'Job Applications',
    'admin.jobApplications.category': 'Job Position',
    'admin.jobApplications.backupEmail': 'Backup Email',
    'admin.jobApplications.whatsappPhone': 'WhatsApp Phone',
    'admin.jobApplications.linkedinUrl': 'LinkedIn URL',
    'admin.jobApplications.githubUrl': 'GitHub URL',
    'admin.jobApplications.facebookUrl': 'Facebook URL',
    'admin.jobApplications.cvFile': 'CV File',
    'admin.jobApplications.experience': 'Experience & Skills',
    'admin.jobApplications.status': 'Status',
    'admin.jobApplications.createdAt': 'Created At',
    'admin.jobApplications.actions': 'Actions',
    'admin.jobApplications.respond': 'Respond',
    'admin.jobApplications.adminNote': 'Admin Note',
    'admin.jobApplications.accept': 'Accept',
    'admin.jobApplications.reject': 'Reject',
    'admin.jobApplications.delete': 'Delete',
    'admin.jobApplications.pending': 'Pending',
    'admin.jobApplications.accepted': 'Accepted',
    'admin.jobApplications.rejected': 'Rejected',
    'admin.jobApplications.noApplications': 'No applications found',
    'admin.jobApplications.back': 'Back',
    'admin.jobApplications.submit': 'Submit',
    'admin.jobApplications.cancel': 'Cancel',
    'sellProduct.title': 'Sell Your Product',
    'sellProduct.productName': 'Product Name',
    'sellProduct.mainImage': 'Main Image',
    'sellProduct.additionalImages': 'Additional Images',
    'sellProduct.startingPrice': 'Starting Price',
    'sellProduct.submit': 'Submit',
    'sellProduct.cancel': 'Cancel',
    'sellProduct.successMessage':
      'Your request has been submitted successfully! It will be reviewed by the admin soon.',
    'sellProduct.errorMessage': 'An error occurred while submitting the product. Please try again.',
    'sellProduct.selectMainImage': 'Select Main Image',
    'sellProduct.removeMainImage': 'Remove Main Image',
    'sellProduct.selectAdditionalImages': 'Select Additional Images',
    'sellProduct.removeAdditionalImage': 'Remove Image',
    'sellProduct.invalidPrice': 'Price must be greater than 0',
    'sellProduct.maxImages': 'Maximum 9 additional images',
    'admin.auctionProducts.title': 'Auction Products',
    'admin.auctionProducts.startingPrice': 'Starting Price',
    'admin.auctionProducts.status': 'Status',
    'admin.auctionProducts.createdAt': 'Created At',
    'admin.auctionProducts.actions': 'Actions',
    'admin.auctionProducts.approve': 'Approve',
    'admin.auctionProducts.reject': 'Reject',
    'admin.auctionProducts.adminNote': 'Admin Note',
    'admin.auctionProducts.pending': 'Pending',
    'admin.auctionProducts.approved': 'Approved',
    'admin.auctionProducts.rejected': 'Rejected',
    'admin.auctionProducts.noProducts': 'No products found',
    'admin.auctionProducts.back': 'Back',
    'admin.auctionProducts.delete': 'Delete',
    'admin.auctionProducts.sendResponse': 'Send',
    'admin.auctionProducts.cancel': 'Cancel',
    'admin.auctionProducts.mainImage': 'Main Image',
    'admin.auctionProducts.additionalImages': 'Additional Images',
    'joinUs.title': 'Join Us',
    'joinUs.category': 'Job Position',
    'joinUs.backupEmail': 'Backup Email',
    'joinUs.whatsappPhone': 'WhatsApp Phone',
    'joinUs.linkedinUrl': 'LinkedIn URL',
    'joinUs.githubUrl': 'GitHub URL',
    'joinUs.facebookUrl': 'Facebook URL',
    'joinUs.cvFile': 'CV File (PDF)',
    'joinUs.experience': 'Experience & Skills',
    'joinUs.submit': 'Submit Application',
    'joinUs.cancel': 'Cancel',
    'joinUs.successMessage':
      'Your application has been submitted successfully! We will contact you soon.',
    'joinUs.errorMessage': 'An error occurred while submitting the application. Please try again.',
    'joinUs.selectFile': 'Select PDF File',
    'joinUs.removeFile': 'Remove File',
    'joinUs.invalidEmail': 'Invalid email address',
    'joinUs.invalidUrl': 'Invalid URL format',
    'joinUs.minLength': 'Text must be at least 20 characters',
    'joinUs.frontendDeveloper': 'Frontend Developer',
    'joinUs.backendDeveloper': 'Backend Developer',
    'joinUs.fullStackDeveloper': 'Full Stack Developer',
    'joinUs.uiUxDesigner': 'UI/UX Designer',
    'joinUs.graphicDesigner': 'Graphic Designer',
    'joinUs.marketingSpecialist': 'Marketing Specialist',
    'joinUs.contentWriter': 'Content Writer',
    'joinUs.dataAnalyst': 'Data Analyst',
    'joinUs.projectManager': 'Project Manager',
    'joinUs.other': 'Other',
    'usersManagement.refreshChart': 'Refresh Chart',
    'usersManagement.refreshingChart': 'Refreshing...',
    'chatbot.yes': 'Yes',
    'chatbot.no': 'No',

    // Navbar
    'navbar.home': 'Home',
    'navbar.auctions': 'Auctions',
    'navbar.joinUs': 'Join Us',
    'navbar.customerService': 'Customer Service',
    'navbar.sellProduct': 'Sell Your Product',
    'navbar.categories': 'Categories',
    'navbar.about': 'About',
    'navbar.contact': 'Contact',
    'navbar.card': 'Card',
    'navbar.profile': 'Profile',
    'navbar.statistics': 'Statistics',
    'navbar.wallet': 'Wallet',
    'navbar.walletAddFunds': 'Add Funds',
    'navbar.walletInstaPay': 'InstaPay',
    'navbar.walletAmount': 'Amount',
    'navbar.walletPhoneNumber': 'Phone Number',
    'navbar.walletDepositImage': 'Deposit Image',
    'navbar.walletSubmitRequest': 'Submit Request',
    'navbar.messages': 'Messages',
    'navbar.noMessages': 'No messages',
    'navbar.requestApproved': 'Deposit request approved',
    'navbar.requestRejected': 'Deposit request rejected',
    'navbar.requestPending': 'Deposit request pending review',
    'navbar.walletPrivacyPolicy': 'I have read the privacy policy',
    'navbar.walletReviewingData': 'Reviewing data...',
    'navbar.walletAddFundsSuccess': 'Funds added successfully!',
    'navbar.walletOK': 'OK',
    'navbar.walletCancel': 'Cancel',
    'navbar.login': 'Login',
    'navbar.register': 'Register',
    'navbar.logout': 'Logout',

    // Admin Money Requests
    'admin.moneyRequests.title': 'Money Requests',
    'admin.moneyRequests.amount': 'Amount',
    'admin.moneyRequests.user': 'User',
    'admin.moneyRequests.phoneNumber': 'Phone Number',
    'admin.moneyRequests.status': 'Status',
    'admin.moneyRequests.depositImage': 'Deposit Image',
    'admin.moneyRequests.createdAt': 'Created At',
    'admin.moneyRequests.actions': 'Actions',
    'admin.moneyRequests.approve': 'Approve',
    'admin.moneyRequests.reject': 'Reject',
    'admin.moneyRequests.reviewNote': 'Review Note',
    'admin.moneyRequests.pending': 'Pending',
    'admin.moneyRequests.approved': 'Approved',
    'admin.moneyRequests.rejected': 'Rejected',
    'admin.moneyRequests.noRequests': 'No requests found',
    'admin.moneyRequests.back': 'Back',
    'admin.moneyRequests.delete': 'Delete',
    'admin.moneyRequests.deleteRequestConfirm': 'Are you sure you want to delete this request?',

    // Admin Send Messages
    'admin.sendMessages.title': 'Send Messages & Sales Management',
    'admin.sendMessages.selectUser': 'Select User',
    'admin.sendMessages.searchUser': 'Search for user...',
    'admin.sendMessages.messageSubject': 'Message Subject',
    'admin.sendMessages.messageText': 'Message Text',
    'admin.sendMessages.enterSubject': 'Enter message subject...',
    'admin.sendMessages.enterMessage': 'Enter message text...',
    'admin.sendMessages.sendMessage': 'Send Message',
    'admin.sendMessages.sending': 'Sending...',
    'admin.sendMessages.success': 'Message sent successfully',
    'admin.sendMessages.error': 'Error sending message',
    'admin.sendMessages.back': 'Back',
    'admin.sendMessages.cancel': 'Cancel',

    // Home Page
    'home.hero.title': 'Mazzady',
    'home.hero.subtitle':
      'Leading Online Auction Platform - Discover the Best Deals and Exclusive Offers',
    'home.howItWorks.title': 'How It Works',
    'home.howItWorks.step1.title': 'Create Your Account',
    'home.howItWorks.step1.description':
      'Create your account easily in just a few minutes. Just fill in your basic information, verify your email, and start your journey with us.',
    'home.howItWorks.step2.title': 'Participate in Auctions',
    'home.howItWorks.step2.description':
      'Browse live auctions and participate in bidding on products that interest you. Win the best deals at competitive prices.',
    'home.featuredAuctions.title': 'Featured Online Auctions',
    'home.stats.title': 'Platform Statistics',
    'home.stats.totalUsers': 'Registered Users',
    'home.stats.totalProducts': 'Products Listed',
    'home.stats.endedAuctions': 'Completed Auctions',
    'home.projectJourney.title': 'How We Built This Project',
    'home.projectJourney.subtitle': 'The journey of developing Mazzady from idea to reality',
    'home.projectJourney.point1.title': 'Planning & Design',
    'home.projectJourney.point1.content':
      'The project started with comprehensive planning where we designed the infrastructure, interfaces, and defined core features. Modern design tools were used to create a professional user experience.',
    'home.projectJourney.point2.title': 'Backend Development',
    'home.projectJourney.point2.content':
      'The backend was built using NestJS with MongoDB to ensure high performance and scalability. RESTful API architecture was implemented with a secure authentication system.',
    'home.projectJourney.point3.title': 'Frontend Development',
    'home.projectJourney.point3.content':
      'The frontend was built using Angular with Standalone Components and Signals to ensure high performance and smooth user experience. Responsive design was applied for all devices.',
    'home.projectJourney.point4.title': 'Authentication System',
    'home.projectJourney.point4.content':
      'An advanced authentication system was developed with email verification, OAuth (Google & Facebook), and Remember Me functionality. bcrypt was used for password encryption.',
    'home.projectJourney.point5.title': 'Auctions System',
    'home.projectJourney.point5.content':
      'A complete auction system was built with live Timer, bidding system, and comprehensive auction management. Statuses are automatically updated and products are created when auctions end.',
    'home.projectJourney.point6.title': 'Messages & Notifications',
    'home.projectJourney.point6.content':
      'A comprehensive messaging system was developed with Floating Menu and Navbar Messages. Messages are automatically updated every 30 seconds with the ability to delete after response.',
    'home.projectJourney.point7.title': 'Admin System',
    'home.projectJourney.point7.content':
      'An integrated admin dashboard was built with user management, products, auctions, and deposit requests. Guard system was implemented to protect pages.',
    'home.projectJourney.point8.title': 'Translation & Theme',
    'home.projectJourney.point8.content':
      'A complete translation system (Arabic/English) was developed with automatic RTL/LTR switching. Theme system (Dark/Light Mode) was added with preference saving.',
    'home.projectJourney.point9.title': 'Optimizations & Performance',
    'home.projectJourney.point9.content':
      'Performance was comprehensively optimized with lazy loading, code splitting, and optimized animations. CSS containment and transform-only animations were used to ensure high performance.',
    'home.projectJourney.point10.title': 'Testing & Development',
    'home.projectJourney.point10.content':
      'All features were thoroughly tested with error handling and memory leak fixes. Best practices were applied throughout the project.',
    'home.projectJourney.modal.close': 'Close',
    'home.contact.title': 'Contact Us for Work',
    'home.contact.subtitle': 'Want to be part of the Mazzady team? Contact us now!',
    'home.contact.button': 'Contact Us',

    // Auctions
    'auctions.title': 'Auctions',
    'auctions.searchPlaceholder': 'Search for a product or seller...',
    'auctions.category': 'Category',
    'auctions.allCategories': 'All Categories',
    'auctions.filters': 'Filters',
    'auctions.priceRange': 'Price Range',
    'auctions.sortBy': 'Sort By',
    'auctions.newest': 'Newest',
    'auctions.oldest': 'Oldest',
    'auctions.priceLowToHigh': 'Price: Low to High',
    'auctions.priceHighToLow': 'Price: High to Low',
    'auctions.noProducts': 'No products available',
    'auctions.startingPrice': 'Starting Price',
    'auctions.currentBid': 'Current Bid',
    'auctions.viewDetails': 'View Details',
    'auctions.applyFilters': 'Apply Filters',
    'auctions.clearFilters': 'Clear Filters',
    'auctions.closeFilters': 'Close Filters',
    'auctions.categories.all': 'All Categories',
    'auctions.categories.electronics': 'Electronics',
    'auctions.categories.fashion': 'Fashion',
    'auctions.categories.home': 'Home',
    'auctions.categories.vehicles': 'Vehicles',
    'auctions.categories.art': 'Art',
    'auctions.categories.jewelry': 'Jewelry',
    'auctions.categories.books': 'Books',
    'auctions.categories.sports': 'Sports',
    'auctions.categories.other': 'Other',
    'auctions.sellers': 'Sellers',
    'auctions.sellersModal.title': 'All Sellers',
    'auctions.sellersModal.totalAuctions': 'Total Auctions',
    'auctions.sellersModal.likes': 'Likes',
    'auctions.sellersModal.rating': 'Rating',
    'auctions.sellersModal.noSellers': 'No sellers available',
    'auctions.sellersModal.close': 'Close',

    // Footer
    'footer.about': 'About Us',
    'footer.quickLinks': 'Quick Links',
    'footer.legal': 'Legal',
    'footer.contact': 'Contact',
    'footer.followUs': 'Follow Us',
    'footer.allRightsReserved': 'All Rights Reserved © 2026 Mazzady',

    // Registration
    'register.welcome': 'Welcome to Mazzady',
    'register.personalInfo': 'Personal Information',
    'register.fullName': 'Full Name',
    'register.firstName': 'First Name',
    'register.middleName': 'Middle Name',
    'register.lastName': 'Last Name',
    'register.nickname': 'Nickname',
    'register.phoneNumber': 'Egyptian Phone Number',
    'register.nationalId': 'National ID',
    'register.email': 'Email',
    'register.verifyEmail': 'Verify Your Email',
    'register.verificationCode': 'Verification Code',
    'register.password': 'Password',
    'register.confirmPassword': 'Confirm Password',
    'register.reviewInfo': 'Review Your Information',
    'register.success': 'Registration Successful!',
    'register.successMessage':
      'Your data has been verified and your account has been created successfully.',
    'register.redirecting': 'Redirecting to login page in',
    'register.goToLogin': 'Go to Login Now',

    // Login
    'login.welcome': 'Welcome to Mazzady',
    'login.welcomeBack': 'Welcome Back',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.rememberMe': 'Remember Me',
    'login.rememberMeInfo':
      'Your session will remain active for 7 days only when Remember Me is enabled.',
    'login.reviewInfo': 'Review Your Information',
    'login.verifyCode': 'Verification Code',
    'login.welcomeBackTitle': 'Welcome Back!',
    'login.welcomeBackMessage': 'You have successfully logged in',
    'login.redirecting': 'Redirecting to home page in',
    'login.verifyAndLogin': 'Verify & Login',
    'login.verifying': 'Verifying...',
    'login.loggingIn': 'Logging in...',

    // Validation Messages
    'validation.required': 'This field is required',
    'validation.email': 'Please enter a valid email address',
    'validation.minLength': 'Must be at least {min} characters',
    'validation.passwordMismatch': 'Passwords do not match',
    'validation.invalidPhone': 'Please enter a valid Egyptian phone number',
    'validation.invalidNationalId': 'Please enter a valid Egyptian National ID (14 digits)',
    'validation.nationalIdExists': 'This National ID is already registered',
    'validation.emailExists': 'This email is already registered',
    'validation.nicknameExists': 'This nickname already exists',
    'validation.phoneExists': 'This phone number is already registered',
    'validation.weakPassword': 'Weak Password',
    'validation.mediumPassword': 'Medium Strength',
    'validation.strongPassword': 'Strong Password',
    'validation.nameRequired': 'All name fields are required (min 2 characters each)',
    'validation.nicknameRequired': 'Nickname is required (min 3 characters)',
    'validation.passwordMinLength': 'Password must be at least 6 characters',
    'validation.verificationCode': 'Please enter the 6-digit verification code',
    'validation.verificationCode6Digits': 'Please enter a valid 6-digit code',

    // Errors
    'error.invalidEmail': 'Please enter a valid email address',
    'error.invalidCode': 'Invalid verification code',
    'error.codeExpired': 'Verification code has expired',
    'error.registrationFailed': 'Registration failed',
    'error.loginFailed': 'Login failed',
  },
};

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private currentLanguage = signal<Language>('ar');

  // Get current language
  language = computed(() => this.currentLanguage());

  // Check if Arabic
  isArabic = computed(() => this.currentLanguage() === 'ar');

  // Check if English
  isEnglish = computed(() => this.currentLanguage() === 'en');

  constructor() {
    // Load language from localStorage or default to Arabic
    const savedLang = localStorage.getItem('mazzady_language') as Language;
    if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
      this.currentLanguage.set(savedLang);
    } else {
      this.currentLanguage.set('ar');
      localStorage.setItem('mazzady_language', 'ar');
    }
  }

  // Translate function
  translate(key: keyof TranslationKeys, params?: Record<string, string | number>): string {
    const lang = this.currentLanguage();
    let translation = translations[lang][key] || key;

    // Replace parameters
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
      });
    }

    return translation;
  }

  // Shortcut for translate
  t(key: keyof TranslationKeys, params?: Record<string, string | number>): string {
    return this.translate(key, params);
  }

  // Change language
  setLanguage(lang: Language): void {
    this.currentLanguage.set(lang);
    localStorage.setItem('mazzady_language', lang);

    // Update HTML dir and lang attributes
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }

  // Toggle language
  toggleLanguage(): void {
    const newLang = this.currentLanguage() === 'ar' ? 'en' : 'ar';
    this.setLanguage(newLang);
  }
}
