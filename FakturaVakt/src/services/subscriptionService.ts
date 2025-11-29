/**
 * FakturaVakt Subscription Service
 * متوافق مع Google Play Billing
 * 
 * يتطلب تثبيت: npm install react-native-iap
 */

import EncryptedStorage from 'react-native-encrypted-storage';

// أنواع الاشتراكات
export type SubscriptionTier = 'free' | 'premium_monthly' | 'premium_yearly';

// معرفات المنتجات في Google Play Console
// ستحتاج لإنشاء هذه في Google Play Console
export const PRODUCT_IDS = {
  PREMIUM_MONTHLY: 'fakturavakt_premium_monthly',  // 49 SEK/شهر
  PREMIUM_YEARLY: 'fakturavakt_premium_yearly',    // 399 SEK/سنة (توفير ~20%)
};

// حدود النسخة المجانية
export const FREE_TIER_LIMITS = {
  maxBills: 10,
  maxSubscriptions: 3,
  maxContracts: 2,
  canScanInvoices: false,
  canExportReports: false,
  canUseVAB: false,
  canSyncCloud: false,
  hasAds: true,
};

// مميزات النسخة المدفوعة
export const PREMIUM_FEATURES = {
  maxBills: Infinity,
  maxSubscriptions: Infinity,
  maxContracts: Infinity,
  canScanInvoices: true,
  canExportReports: true,
  canUseVAB: true,
  canSyncCloud: true,
  hasAds: false,
};

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  expiryDate: string | null;
  isActive: boolean;
  productId: string | null;
  purchaseToken: string | null;
}

export interface SubscriptionProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceAmount: number;
  currency: string;
  period: 'monthly' | 'yearly';
}

// التسعير المقترح (SEK)
export const PRICING = {
  monthly: {
    price: 49,
    currency: 'SEK',
    period: 'månad',
    savings: null,
  },
  yearly: {
    price: 399,
    currency: 'SEK',
    period: 'år',
    savings: '32%', // توفير مقارنة بالشهري
  },
};

class SubscriptionService {
  private subscriptionInfo: SubscriptionInfo = {
    tier: 'free',
    expiryDate: null,
    isActive: false,
    productId: null,
    purchaseToken: null,
  };

  private isInitialized = false;

  /**
   * تهيئة خدمة الاشتراكات
   * يجب استدعاؤها عند بدء التطبيق
   */
  async initialize(): Promise<void> {
    try {
      // تحميل حالة الاشتراك المحفوظة
      const savedSubscription = await EncryptedStorage.getItem('subscription_info');
      if (savedSubscription) {
        this.subscriptionInfo = JSON.parse(savedSubscription);
        
        // التحقق من انتهاء الصلاحية
        if (this.subscriptionInfo.expiryDate) {
          const expiry = new Date(this.subscriptionInfo.expiryDate);
          if (expiry < new Date()) {
            // الاشتراك منتهي
            await this.resetToFree();
          }
        }
      }
      
      this.isInitialized = true;
      console.log('Subscription service initialized:', this.subscriptionInfo.tier);
    } catch (error) {
      console.error('Error initializing subscription service:', error);
      this.isInitialized = true;
    }
  }

  /**
   * الحصول على حالة الاشتراك الحالية
   */
  getSubscriptionInfo(): SubscriptionInfo {
    return { ...this.subscriptionInfo };
  }

  /**
   * التحقق مما إذا كان المستخدم Premium
   */
  isPremium(): boolean {
    return this.subscriptionInfo.tier !== 'free' && this.subscriptionInfo.isActive;
  }

  /**
   * الحصول على الميزات المتاحة حسب الاشتراك
   */
  getFeatures() {
    return this.isPremium() ? PREMIUM_FEATURES : FREE_TIER_LIMITS;
  }

  /**
   * التحقق من إمكانية إضافة فاتورة جديدة
   */
  canAddBill(currentCount: number): boolean {
    const features = this.getFeatures();
    return currentCount < features.maxBills;
  }

  /**
   * التحقق من إمكانية استخدام ميزة معينة
   */
  canUseFeature(feature: keyof typeof PREMIUM_FEATURES): boolean {
    const features = this.getFeatures();
    return features[feature] as boolean;
  }

  /**
   * حفظ حالة الاشتراك
   */
  private async saveSubscription(): Promise<void> {
    try {
      await EncryptedStorage.setItem(
        'subscription_info',
        JSON.stringify(this.subscriptionInfo)
      );
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  }

  /**
   * إعادة الاشتراك للنسخة المجانية
   */
  async resetToFree(): Promise<void> {
    this.subscriptionInfo = {
      tier: 'free',
      expiryDate: null,
      isActive: false,
      productId: null,
      purchaseToken: null,
    };
    await this.saveSubscription();
  }

  /**
   * معالجة عملية شراء ناجحة
   * يُستدعى بعد الشراء من Google Play
   */
  async handleSuccessfulPurchase(
    productId: string,
    purchaseToken: string
  ): Promise<void> {
    const isYearly = productId === PRODUCT_IDS.PREMIUM_YEARLY;
    const expiryDate = new Date();
    
    if (isYearly) {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }

    this.subscriptionInfo = {
      tier: isYearly ? 'premium_yearly' : 'premium_monthly',
      expiryDate: expiryDate.toISOString(),
      isActive: true,
      productId,
      purchaseToken,
    };

    await this.saveSubscription();
    console.log('Subscription activated:', this.subscriptionInfo);
  }

  /**
   * التحقق من صلاحية الاشتراك مع Google Play
   * يجب استدعاؤها دورياً
   */
  async verifySubscription(): Promise<boolean> {
    // في الإنتاج، يجب التحقق من الاشتراك مع سيرفر خاص بك
    // الذي بدوره يتحقق مع Google Play API
    
    if (!this.subscriptionInfo.purchaseToken) {
      return false;
    }

    // للتطوير: فقط تحقق من تاريخ الانتهاء
    if (this.subscriptionInfo.expiryDate) {
      const expiry = new Date(this.subscriptionInfo.expiryDate);
      const isValid = expiry > new Date();
      
      if (!isValid) {
        await this.resetToFree();
      }
      
      return isValid;
    }

    return false;
  }

  /**
   * استعادة المشتريات السابقة
   */
  async restorePurchases(): Promise<boolean> {
    // سيتم التنفيذ مع react-native-iap
    // يستعيد المشتريات من Google Play
    console.log('Restoring purchases...');
    return false;
  }
}

// Singleton instance
export const subscriptionService = new SubscriptionService();
export default subscriptionService;
