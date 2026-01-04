
import React, { useState, useEffect } from 'react';
import { 
  Users, Home, CreditCard, AlertCircle, 
  BarChart3, LayoutDashboard, Plus, Search,
  Menu, X, ChevronRight, UserCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { dataService } from './services/dataService';
import { 
  Student, Room, Payment, Complaint, 
  RoomStatus, PaymentStatus, ComplaintStatus, PaymentMode
} from './types';

// Sidebar Item Component
const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  active: boolean, 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
    {active && <ChevronRight size={16} className="ml-auto" />}
  </button>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  
  // Report States
  const [roomOccupancyData, setRoomOccupancyData] = useState<any[]>([]);
  const [complaintStatusData, setComplaintStatusData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  // Fetch all data
  const refreshData = async () => {
    const [r, s, p, c] = await Promise.all([
      dataService.getRooms(),
      dataService.getStudents(),
      dataService.getPayments(),
      dataService.getComplaints()
    ]);
    setRooms(r);
    setStudents(s);
    setPayments(p);
    setComplaints(c);

    // Reports
    const occ = await dataService.getReportOccupancy();
    const cmp = await dataService.getReportComplaintsByStatus();
    const rev = await dataService.getReportMonthlyCollection();
    setRoomOccupancyData(occ);
    setComplaintStatusData(cmp);
    setRevenueData(rev);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const renderDashboard = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: students.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Rooms Available', value: rooms.filter(r => r.status === RoomStatus.AVAILABLE).length, icon: Home, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Complaints', value: complaints.filter(c => c.status !== ComplaintStatus.RESOLVED).length, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Monthly Revenue', value: `$${revenueData.reduce((acc, curr) => acc + curr.total, 0)}`, icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 className="text-blue-600" size={20} />
            Revenue Collection (Aggregated)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <LayoutDashboard className="text-emerald-600" size={20} />
            Room Occupancy Report
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roomOccupancyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roomOccupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Recent Complaints</h3>
          <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-semibold">Student</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {complaints.slice(0, 5).map((complaint) => (
                <tr key={complaint.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-700">
                    {students.find(s => s.id === complaint.studentId)?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium">{complaint.complaintType}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      complaint.status === ComplaintStatus.RESOLVED ? 'bg-emerald-100 text-emerald-700' :
                      complaint.status === ComplaintStatus.IN_PROGRESS ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fadeIn">
      <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Student Directory</h3>
          <p className="text-sm text-slate-500">Manage hostel residents and assignments</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search students..." 
              className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button 
            onClick={async () => {
              await dataService.addStudent({
                name: 'New Student',
                rollNumber: `X${Math.floor(Math.random()*1000)}`,
                department: 'Mechanical',
                year: 1,
                roomId: 'r1',
                contactNumber: '1234567890',
                joiningDate: new Date().toISOString().split('T')[0]
              });
              refreshData();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} /> Add Student
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm">
            <tr>
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Roll No</th>
              <th className="px-6 py-4 font-semibold">Dept & Year</th>
              <th className="px-6 py-4 font-semibold">Room</th>
              <th className="px-6 py-4 font-semibold">Contact</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      {student.name.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-800">{student.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 font-mono">{student.rollNumber}</td>
                <td className="px-6 py-4 text-slate-600">
                  {student.department} • Year {student.year}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <span className="bg-slate-100 px-2 py-1 rounded text-xs font-semibold">
                    Room {rooms.find(r => r.id === student.roomId)?.roomNumber || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{student.contactNumber}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={async () => {
                      if(confirm('Delete student?')) {
                        await dataService.deleteStudent(student.id);
                        refreshData();
                      }
                    }}
                    className="text-rose-500 hover:text-rose-700 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRooms = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
      {rooms.map(room => (
        <div key={room.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6 hover:border-blue-200 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-blue-50 transition-colors">
              <Home className="text-slate-400 group-hover:text-blue-500" size={24} />
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              room.status === RoomStatus.AVAILABLE ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {room.status}
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">Room {room.roomNumber}</h3>
          <p className="text-slate-500 text-sm mb-6">Floor {room.floor} • Capacity {room.capacity}</p>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Occupancy</span>
              <span className="font-semibold text-slate-800">{room.occupiedBeds} / {room.capacity} Beds</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  (room.occupiedBeds / room.capacity) > 0.8 ? 'bg-rose-500' : 'bg-blue-500'
                }`}
                style={{ width: `${(room.occupiedBeds / room.capacity) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="mt-6 flex gap-2">
            <button className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-sm font-medium transition-colors">
              Manage Beds
            </button>
            <button className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-sm font-medium transition-colors">
              View History
            </button>
          </div>
        </div>
      ))}
      <button 
        onClick={async () => {
          await dataService.addRoom({
            roomNumber: `${100 + rooms.length + 1}`,
            floor: 1,
            capacity: 2
          });
          refreshData();
        }}
        className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-all"
      >
        <Plus size={32} />
        <span className="font-medium text-lg">Add New Room</span>
      </button>
    </div>
  );

  const renderPayments = () => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fadeIn">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Fee Transactions</h3>
        <button 
          onClick={async () => {
             await dataService.addPayment({
               studentId: students[0]?.id || 's1',
               amount: 5000,
               paymentDate: new Date().toISOString().split('T')[0],
               paymentMode: PaymentMode.UPI,
               month: 'February',
               status: PaymentStatus.PAID
             });
             refreshData();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Record Payment
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm">
            <tr>
              <th className="px-6 py-4 font-semibold">Student</th>
              <th className="px-6 py-4 font-semibold">Month</th>
              <th className="px-6 py-4 font-semibold">Amount</th>
              <th className="px-6 py-4 font-semibold">Mode</th>
              <th className="px-6 py-4 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm">
            {payments.map(payment => (
              <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">
                  {students.find(s => s.id === payment.studentId)?.name || 'Unknown'}
                </td>
                <td className="px-6 py-4 text-slate-600">{payment.month}</td>
                <td className="px-6 py-4 font-semibold text-slate-800">${payment.amount}</td>
                <td className="px-6 py-4 text-slate-500">{payment.paymentMode}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    payment.status === PaymentStatus.PAID ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-50 w-72 transform transition-transform duration-300 lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <Home size={24} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              HostelPro
            </h1>
            <button className="lg:hidden ml-auto" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
            />
            <SidebarItem 
              icon={Users} 
              label="Students" 
              active={activeTab === 'students'} 
              onClick={() => setActiveTab('students')} 
            />
            <SidebarItem 
              icon={Home} 
              label="Rooms" 
              active={activeTab === 'rooms'} 
              onClick={() => setActiveTab('rooms')} 
            />
            <SidebarItem 
              icon={CreditCard} 
              label="Payments" 
              active={activeTab === 'payments'} 
              onClick={() => setActiveTab('payments')} 
            />
            <SidebarItem 
              icon={AlertCircle} 
              label="Complaints" 
              active={activeTab === 'complaints'} 
              onClick={() => setActiveTab('complaints')} 
            />
          </nav>

          <div className="mt-auto p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
            <UserCircle className="text-slate-400" size={32} />
            <div>
              <p className="text-sm font-bold text-slate-800">Admin Account</p>
              <p className="text-xs text-slate-500">Hostel Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 min-h-screen transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : ''}`}>
        {/* Navbar */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-lg lg:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} className="text-slate-600" />
            </button>
            <h2 className="text-lg font-bold text-slate-800 capitalize">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-inner flex items-center justify-center text-white font-bold">
              A
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-8">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'students' && renderStudents()}
          {activeTab === 'rooms' && renderRooms()}
          {activeTab === 'payments' && renderPayments()}
          {activeTab === 'complaints' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fadeIn">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800">Complaints Registry</h3>
                <button 
                  onClick={async () => {
                    await dataService.addComplaint({
                      studentId: students[0]?.id || 's1',
                      roomId: rooms[0]?.id || 'r1',
                      complaintType: 'Internet',
                      description: 'Wifi speed is too slow in 101',
                      status: ComplaintStatus.OPEN
                    });
                    refreshData();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  File Complaint
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-sm">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Student</th>
                      <th className="px-6 py-4 font-semibold">Room</th>
                      <th className="px-6 py-4 font-semibold">Issue</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                    {complaints.map(complaint => (
                      <tr key={complaint.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {students.find(s => s.id === complaint.studentId)?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {rooms.find(r => r.id === complaint.roomId)?.roomNumber || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-800">{complaint.complaintType}</p>
                          <p className="text-slate-500 text-xs truncate max-w-xs">{complaint.description}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            complaint.status === ComplaintStatus.RESOLVED ? 'bg-emerald-100 text-emerald-700' :
                            complaint.status === ComplaintStatus.IN_PROGRESS ? 'bg-amber-100 text-amber-700' :
                            'bg-rose-100 text-rose-700'
                          }`}>
                            {complaint.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select 
                            className="bg-white border border-slate-200 rounded p-1 text-xs"
                            onChange={async (e) => {
                              await dataService.updateComplaintStatus(complaint.id, e.target.value as ComplaintStatus);
                              refreshData();
                            }}
                            value={complaint.status}
                          >
                            {Object.values(ComplaintStatus).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
