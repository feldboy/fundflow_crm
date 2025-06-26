import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Icon from '../AppIcon';

const Header = () => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { 
      path: '/cases', 
      label: 'Cases', 
      icon: 'FolderOpen',
      subItems: [
        { path: '/case-management', label: 'Case Management' },
        { path: '/client-intake-form', label: 'Client Intake' },
        { path: '/ai-risk-assessment', label: 'AI Risk Assessment' }
      ]
    },
    { path: '/client-communication-hub', label: 'Communications', icon: 'MessageSquare' },
    { path: '/financial-calculator-reporting', label: 'Finance', icon: 'Calculator' },
    { path: '/api-demo', label: 'API Demo', icon: 'Code' }
  ];

  const isActiveRoute = (path) => {
    if (path === '/cases') {
      return ['/case-management', '/client-intake-form', '/ai-risk-assessment'].includes(location.pathname);
    }
    return location.pathname === path;
  };

  const notifications = [
    { id: 1, type: 'info', message: 'New case assigned for review', time: '5 min ago' },
    { id: 2, type: 'warning', message: 'Risk assessment pending approval', time: '15 min ago' },
    { id: 3, type: 'success', message: 'Funding approved for Case #12345', time: '1 hour ago' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-surface border-b border-border z-1000">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="DollarSign" size={20} color="white" />
              </div>
              <span className="text-xl font-semibold text-text-primary font-heading">
                FundFlow
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <div key={item.path} className="relative group">
                  <Link
                    to={item.path === '/cases' ? '/case-management' : item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-micro ${
                      isActiveRoute(item.path)
                        ? 'bg-primary text-white' :'text-text-secondary hover:text-text-primary hover:bg-background'
                    }`}
                  >
                    <Icon name={item.icon} size={16} />
                    <span>{item.label}</span>
                  </Link>

                  {/* Dropdown for Cases */}
                  {item.subItems && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-surface border border-border rounded-lg shadow-overlay opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-standard z-1100">
                      <div className="py-2">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`block px-4 py-2 text-sm transition-micro ${
                              location.pathname === subItem.path
                                ? 'bg-primary text-white' :'text-text-secondary hover:text-text-primary hover:bg-background'
                            }`}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <div className={`flex items-center transition-standard ${
                isSearchExpanded ? 'w-80' : 'w-10'
              }`}>
                <button
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  className="p-2 text-text-secondary hover:text-text-primary transition-micro"
                >
                  <Icon name="Search" size={20} />
                </button>
                {isSearchExpanded && (
                  <input
                    type="text"
                    placeholder="Search cases, clients..."
                    className="flex-1 ml-2 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    autoFocus
                    onBlur={() => setIsSearchExpanded(false)}
                  />
                )}
              </div>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 text-text-secondary hover:text-text-primary transition-micro"
              >
                <Icon name="Bell" size={20} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {isNotificationOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-surface border border-border rounded-lg shadow-overlay z-1100">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-medium text-text-primary">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-4 border-b border-border hover:bg-background transition-micro">
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === 'success' ? 'bg-success' :
                            notification.type === 'warning' ? 'bg-warning' : 'bg-accent'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm text-text-primary">{notification.message}</p>
                            <p className="text-xs text-text-secondary mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-border">
                    <button className="text-sm text-primary hover:text-primary/80 transition-micro">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <Icon name="User" size={16} color="white" />
              </div>
              <span className="hidden md:block text-sm font-medium text-text-primary">
                John Doe
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-text-secondary hover:text-text-primary transition-micro"
            >
              <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-border">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <div key={item.path}>
                  <Link
                    to={item.path === '/cases' ? '/case-management' : item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-micro ${
                      isActiveRoute(item.path)
                        ? 'bg-primary text-white' :'text-text-secondary hover:text-text-primary hover:bg-background'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon name={item.icon} size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                  
                  {item.subItems && isActiveRoute(item.path) && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`block px-4 py-2 text-sm rounded-lg transition-micro ${
                            location.pathname === subItem.path
                              ? 'bg-primary/20 text-primary' :'text-text-secondary hover:text-text-primary hover:bg-background'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;