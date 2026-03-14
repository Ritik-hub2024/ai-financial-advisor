import React ,{ useState } from 'react';
import { Shield, Key, Bell, Lock, Eye, EyeOff, Save, User as UserIcon, Mail, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileProps {
}

export const Profile: React.FC<ProfileProps> = () => {
  const { user, logout: _logout } = useAuth();
  const [activeSection, setActiveSection] = useState<'profile' | 'security'>('profile');
  
  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  
  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);
  
  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [goalReminders, setGoalReminders] = useState(true);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    
    if (!name.trim()) {
      setProfileError("Name cannot be empty");
      return;
    }

    // Simulate profile update
    await new Promise(resolve => setTimeout(resolve, 500));
    setProfileSuccess("Profile updated successfully!");
    
    // Update local storage
    const storedAuth = localStorage.getItem('finai_auth');
    if (storedAuth) {
      const userData = JSON.parse(storedAuth);
      userData.name = name;
      localStorage.setItem('finai_auth', JSON.stringify(userData));
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);
    setSecuritySuccess(null);
    
    if (!currentPassword) {
      setSecurityError("Please enter your current password");
      return;
    }
    
    if (!newPassword) {
      setSecurityError("Please enter a new password");
      return;
    }
    
    if (newPassword.length < 6) {
      setSecurityError("Password must be at least 6 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setSecurityError("New passwords do not match");
      return;
    }

    // Simulate password change
    await new Promise(resolve => setTimeout(resolve, 500));
    setSecuritySuccess("Password changed successfully!");
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card !p-0 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <UserIcon className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.name || 'User'}</h2>
              <p className="text-emerald-100">{user?.email}</p>
              <p className="text-emerald-200 text-sm mt-1">
                Member since {user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-200">
          <button
            onClick={() => setActiveSection('profile')}
            className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center gap-2 ${
              activeSection === 'profile' 
                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50' 
                : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            Profile
          </button>
          <button
            onClick={() => setActiveSection('security')}
            className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center gap-2 ${
              activeSection === 'security' 
                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50' 
                : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            <Shield className="w-4 h-4" />
            Security
          </button>
        </div>

        <div className="p-6">
          {activeSection === 'profile' ? (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              {profileSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  {profileSuccess}
                </div>
              )}
              {profileError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  {profileError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-zinc-400" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-zinc-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-500 cursor-not-allowed"
                    placeholder="Email cannot be changed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  Account Created
                </label>
                <div className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-600">
                  {user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              {/* Security Success/Error Messages */}
              {securitySuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  {securitySuccess}
                </div>
              )}
              {securityError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  {securityError}
                </div>
              )}

              {/* Change Password Section */}
              <div>
                <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2 mb-4">
                  <Key className="w-5 h-5 text-emerald-600" />
                  Change Password
                </h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all pr-12"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">New Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Confirm Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Update Password
                  </button>
                </form>
              </div>

              {/* Security Features */}
              <div className="pt-4 border-t border-zinc-200">
                <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  Security Features
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="font-medium text-zinc-900">Two-Factor Authentication</p>
                        <p className="text-sm text-zinc-500">Add an extra layer of security</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="font-medium text-zinc-900">Login History</p>
                        <p className="text-sm text-zinc-500">View your recent login activity</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                      Active
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="font-medium text-zinc-900">Data Encryption</p>
                        <p className="text-sm text-zinc-500">Your data is encrypted at rest</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                      Enabled
                    </span>
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="pt-4 border-t border-zinc-200">
                <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2 mb-4">
                  <Bell className="w-5 h-5 text-emerald-600" />
                  Notification Preferences
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl cursor-pointer hover:bg-zinc-100 transition-colors">
                    <div>
                      <p className="font-medium text-zinc-900">Email Notifications</p>
                      <p className="text-sm text-zinc-500">Receive updates via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="w-5 h-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl cursor-pointer hover:bg-zinc-100 transition-colors">
                    <div>
                      <p className="font-medium text-zinc-900">Weekly Financial Report</p>
                      <p className="text-sm text-zinc-500">Get weekly summary of your finances</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={weeklyReport}
                      onChange={(e) => setWeeklyReport(e.target.checked)}
                      className="w-5 h-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl cursor-pointer hover:bg-zinc-100 transition-colors">
                    <div>
                      <p className="font-medium text-zinc-900">Goal Reminders</p>
                      <p className="text-sm text-zinc-500">Reminders for your savings goals</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={goalReminders}
                      onChange={(e) => setGoalReminders(e.target.checked)}
                      className="w-5 h-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

