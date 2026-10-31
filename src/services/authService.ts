import type { UserRole, UserSession, RoleInfo } from '../types';

export const ROLES_DATA: Record<UserRole, RoleInfo> = {
  admin: {
    id: 'admin',
    label: 'Admin',
    badge: 'Super Admin',
    color: 'from-amber-500 to-red-600',
    defaultEmail: 'admin@cit.ac.in',
    defaultRegId: 'CIT-ADM-001',
    description: 'System administration, campus-wide configurations & security audit',
  },
  coordinator: {
    id: 'coordinator',
    label: 'Department Coordinator',
    badge: 'Dept Coord',
    color: 'from-blue-500 to-indigo-600',
    defaultEmail: 'coordinator.cse@cit.ac.in',
    defaultRegId: 'CIT-CRD-104',
    description: 'Curriculum scheduling, branch management & student approvals',
  },
  faculty: {
    id: 'faculty',
    label: 'Faculty',
    badge: 'Faculty Lead',
    color: 'from-emerald-500 to-teal-600',
    defaultEmail: 'faculty.sharma@cit.ac.in',
    defaultRegId: 'CIT-FAC-342',
    description: 'Attendance tracking, grade management & research allocations',
  },
  club_rep: {
    id: 'club_rep',
    label: 'Club Representative',
    badge: 'Student Council',
    color: 'from-purple-500 to-pink-600',
    defaultEmail: 'zephyr.club@cit.ac.in',
    defaultRegId: 'CIT-STU-8821',
    description: 'Technical fest management, workshop approvals & venue booking',
  },
};

// Preset authorized users for realistic CIT database
interface MockUserRecord {
  email: string;
  regId: string;
  passwordHash: string; // Plain mock check for demo
  role: UserRole;
  name: string;
  title: string;
  department: string;
  office: string;
  permissions: string[];
}

const AUTHORIZED_ACCOUNTS: MockUserRecord[] = [
  {
    email: 'admin@cit.ac.in',
    regId: 'CIT-ADM-001',
    passwordHash: 'Admin@Cit2026',
    role: 'admin',
    name: 'Dr. Rajeshwar Sen',
    title: 'Registrar & Chief Systems Administrator',
    department: 'University Administration & Governance',
    office: 'Administrative Block, CIT Central Wing 302',
    permissions: ['Full Access', 'Security Controls', 'Role Management', 'Audit Logs', 'Database Provisioning'],
  },
  {
    email: 'coordinator.cse@cit.ac.in',
    regId: 'CIT-CRD-104',
    passwordHash: 'Coord@Cse2026',
    role: 'coordinator',
    name: 'Prof. Ananya Pattnaik',
    title: 'Academic Head & Department Coordinator',
    department: 'School of Computer Science & Engineering',
    office: 'CIT Academic Complex, Block B - Room 204',
    permissions: ['Curriculum Management', 'Faculty Rostering', 'Hall Allocations', 'Student Transcripts'],
  },
  {
    email: 'faculty.sharma@cit.ac.in',
    regId: 'CIT-FAC-342',
    passwordHash: 'Faculty@Cit2026',
    role: 'faculty',
    name: 'Dr. Manoranjan Sharma',
    title: 'Professor & Head of AI Research Labs',
    department: 'Department of Computer Science & AI',
    office: 'CIT Advanced Computing Lab, 3rd Floor',
    permissions: ['Course Gradebooks', 'Biometric Attendance', 'Lab Equipment Access', 'Research Grants'],
  },
  {
    email: 'zephyr.club@cit.ac.in',
    regId: 'CIT-STU-8821',
    passwordHash: 'Zephyr@Cit2026',
    role: 'club_rep',
    name: 'Abhinav Nayak',
    title: 'Lead Organizer & President, TechZephyr CIT',
    department: 'CIT Student Technical Society & Innovation Cell',
    office: 'Student Activity Center (SAC), Ground Floor',
    permissions: ['Auditorium Booking', 'Event Approvals', 'Budget Requisitions', 'Sponsorship Management'],
  },
];

export interface AuthResponse {
  success: boolean;
  message?: string;
  session?: UserSession;
  error?: string;
}

export const authenticateUser = async (
  regIdOrEmail: string,
  password: string,
  selectedRole?: UserRole
): Promise<AuthResponse> => {
  const trimmedInput = regIdOrEmail.trim().toLowerCase();

  // Try real backend endpoint if configured in environment
  const backendUrl = import.meta.env.VITE_API_URL;
  if (backendUrl) {
    try {
      const res = await fetch(`${backendUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: trimmedInput, password, role: selectedRole }),
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, session: data.session };
      }
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.message || 'Authentication failed from backend.' };
    } catch {
      // Fallback to local university verification if network fails
      console.warn('Backend unavailable, verifying against CIT active directory locally.');
    }
  }

  // Realistic network latency simulation (500ms - 900ms)
  await new Promise((resolve) => setTimeout(resolve, 750));

  // Find user by either email or registration ID
  const matchedUser = AUTHORIZED_ACCOUNTS.find(
    (u) =>
      u.email.toLowerCase() === trimmedInput ||
      u.regId.toLowerCase() === trimmedInput
  );

  if (!matchedUser) {
    return {
      success: false,
      error: 'Registration ID or Email not found in CIT Active Directory. Please verify your credentials.',
    };
  }

  // Check password
  if (matchedUser.passwordHash !== password) {
    return {
      success: false,
      error: 'Incorrect security password. Please re-check or use the reset link.',
    };
  }

  // If role is explicitly chosen, check role compatibility
  if (selectedRole && matchedUser.role !== selectedRole) {
    return {
      success: false,
      error: `Account role mismatch: This account belongs to "${ROLES_DATA[matchedUser.role].label}", not "${ROLES_DATA[selectedRole].label}".`,
    };
  }

  // Build authenticated session object
  const session: UserSession = {
    name: matchedUser.name,
    email: matchedUser.email,
    regId: matchedUser.regId,
    role: matchedUser.role,
    department: matchedUser.department,
    title: matchedUser.title,
    avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    lastLogin: new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    token: `CIT_JWT_${Math.random().toString(36).substring(2, 10).toUpperCase()}_${Date.now()}`,
    permissions: matchedUser.permissions,
    office: matchedUser.office,
  };

  return {
    success: true,
    session,
  };
};

export const getQuickCredentials = (role: UserRole) => {
  const user = AUTHORIZED_ACCOUNTS.find((u) => u.role === role);
  if (!user) return { identifier: '', password: '' };
  return {
    identifier: user.email,
    password: user.passwordHash,
  };
};
