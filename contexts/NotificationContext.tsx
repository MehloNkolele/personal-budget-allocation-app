import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';

export interface Notification {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  time: string;
  read?: boolean;
  category?: string;
  actionType?: 'budget_exceeded' | 'budget_warning' | 'goal_achieved' | 'monthly_summary' | 'low_balance';
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'time'>) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  removeNotification: (id: number) => void;
  clearAllNotifications: () => void;
  generateBudgetNotifications: (categories: any[], transactions: any[], totalIncome: number) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationIdCounter, setNotificationIdCounter] = useState(1);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('budgetApp_notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed);
        // Set counter to highest ID + 1
        const maxId = parsed.reduce((max: number, notif: Notification) => Math.max(max, notif.id), 0);
        setNotificationIdCounter(maxId + 1);
      } catch (error) {
        console.error('Error loading notifications from localStorage:', error);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('budgetApp_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'time'>) => {
    const newNotification: Notification = {
      ...notification,
      id: notificationIdCounter,
      time: formatTimeAgo(new Date()),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setNotificationIdCounter(prev => prev + 1);
  }, [notificationIdCounter]);

  const markAsRead = useCallback((id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const generateBudgetNotifications = useCallback((categories: any[], transactions: any[], totalIncome: number) => {
    // Calculate spending for each category
    const categorySpending = categories.map(category => {
      const categoryTransactions = transactions.filter(t => t.categoryId === category.id && t.type === 'expense');
      const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      const allocated = category.allocatedAmount || 0;
      const percentage = allocated > 0 ? (spent / allocated) * 100 : 0;
      
      return {
        ...category,
        spent,
        percentage
      };
    });

    // Check for budget overruns (100% exceeded)
    categorySpending.forEach(category => {
      if (category.percentage > 100) {
        const existingNotification = notifications.find(n => 
          n.actionType === 'budget_exceeded' && 
          n.category === category.name &&
          !n.read
        );
        
        if (!existingNotification) {
          addNotification({
            message: `Budget exceeded for "${category.name}". You've spent ${category.spent.toFixed(2)} of your ${category.allocatedAmount.toFixed(2)} budget.`,
            type: 'error',
            category: category.name,
            actionType: 'budget_exceeded'
          });
        }
      }
      // Check for budget warnings (80% reached)
      else if (category.percentage > 80 && category.percentage <= 100) {
        const existingNotification = notifications.find(n => 
          n.actionType === 'budget_warning' && 
          n.category === category.name &&
          !n.read
        );
        
        if (!existingNotification) {
          addNotification({
            message: `You're approaching your budget limit for "${category.name}". ${category.percentage.toFixed(0)}% used.`,
            type: 'warning',
            category: category.name,
            actionType: 'budget_warning'
          });
        }
      }
    });

    // Check for overall budget health
    const totalAllocated = categories.reduce((sum, cat) => sum + (cat.allocatedAmount || 0), 0);
    const totalSpent = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    if (totalAllocated > totalIncome && totalIncome > 0) {
      const existingNotification = notifications.find(n => 
        n.actionType === 'low_balance' && !n.read
      );
      
      if (!existingNotification) {
        addNotification({
          message: `Your total budget allocations exceed your income by ${(totalAllocated - totalIncome).toFixed(2)}. Consider adjusting your budget.`,
          type: 'warning',
          actionType: 'low_balance'
        });
      }
    }

    // Achievement notifications
    if (totalSpent > 0 && totalIncome > 0) {
      const savingsRate = ((totalIncome - totalSpent) / totalIncome) * 100;
      if (savingsRate > 20) {
        const existingNotification = notifications.find(n => 
          n.actionType === 'goal_achieved' && !n.read
        );
        
        if (!existingNotification) {
          addNotification({
            message: `Great job! You're saving ${savingsRate.toFixed(0)}% of your income this month.`,
            type: 'success',
            actionType: 'goal_achieved'
          });
        }
      }
    }
  }, [notifications, addNotification]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAllNotifications,
      generateBudgetNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
