/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import BookAppointment from './pages/BookAppointment';
import ChatAssistant from './pages/ChatAssistant';
import DoctorAnalytics from './pages/DoctorAnalytics';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorProfile from './pages/DoctorProfile';
import FindDoctors from './pages/FindDoctors';
import OrderMedicines from './pages/OrderMedicines';
import PatientAppointments from './pages/PatientAppointments';
import PatientDashboard from './pages/PatientDashboard';
import PatientPrescriptions from './pages/PatientPrescriptions';
import Pharmacies from './pages/Pharmacies';
import PharmacyDashboard from './pages/PharmacyDashboard';
import PharmacyOrders from './pages/PharmacyOrders';
import SetLocation from './pages/SetLocation';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import SkinScanner from './pages/SkinScanner';
import SkincareProducts from './pages/SkincareProducts';
import SubscriptionPlans from './pages/SubscriptionPlans';
import SymptomChecker from './pages/SymptomChecker';
import VerifyMedicine from './pages/VerifyMedicine';
import Welcome from './pages/Welcome';
import AboutMediTrust from './pages/AboutMediTrust';
import WritePrescription from './pages/WritePrescription';
import HealthTracker from './pages/HealthTracker';
import SkinHealthcare from './pages/SkinHealthcare';
import DoctorQueueSettings from './pages/DoctorQueueSettings';
import AdBoosters from './pages/AdBoosters';
import UnifiedPricing from './pages/UnifiedPricing';
import __Layout from './Layout.jsx';
import PatientSetup from './pages/PatientSetup';
import DoctorSetup from './pages/DoctorSetup';
import PharmacySetup from './pages/PharmacySetup';

export const PAGES = {
    "BookAppointment": BookAppointment,
    "ChatAssistant": ChatAssistant,
    "DoctorAnalytics": DoctorAnalytics,
    "DoctorAppointments": DoctorAppointments,
    "DoctorDashboard": DoctorDashboard,
    "DoctorProfile": DoctorProfile,
    "FindDoctors": FindDoctors,
    "OrderMedicines": OrderMedicines,
    "PatientAppointments": PatientAppointments,
    "PatientDashboard": PatientDashboard,
    "PatientPrescriptions": PatientPrescriptions,
    "Pharmacies": Pharmacies,
    "PharmacyDashboard": PharmacyDashboard,
    "PharmacyOrders": PharmacyOrders,
    "SetLocation": SetLocation,
    "SignIn": SignIn,
    "SignUp": SignUp,
    "SkinScanner": SkinScanner,
    "SkincareProducts": SkincareProducts,
    "SubscriptionPlans": SubscriptionPlans,
    "SymptomChecker": SymptomChecker,
    "VerifyMedicine": VerifyMedicine,
    "Welcome": Welcome,
    "AboutMediTrust": AboutMediTrust,
    "WritePrescription": WritePrescription,
    "HealthTracker": HealthTracker,
    "SkinHealthcare": SkinHealthcare,
    "DoctorQueueSettings": DoctorQueueSettings,
    "AdBoosters": AdBoosters,
    "UnifiedPricing": UnifiedPricing,
    "PatientSetup": PatientSetup,
    "DoctorSetup": DoctorSetup,
    "PharmacySetup": PharmacySetup,
}

export const pagesConfig = {
    mainPage: "Welcome",
    Pages: PAGES,
    Layout: __Layout,
};