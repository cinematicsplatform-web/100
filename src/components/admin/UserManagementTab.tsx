import React, { useState } from 'react';
import { UserRole } from '../../types';

const UserManagementTab: React.FC<any> = ({users, onAddAdmin, onRequestDelete, addToast}) => { 
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState(''); 
    const [firstName, setFirstName] = useState(''); 
    const handleAddAdminSubmit = async (e: React.FormEvent) => { 
        e.preventDefault(); 
        if (email && password) { 
            try { 
                await onAddAdmin({email, password, firstName}); 
                setEmail(''); 
                setPassword(''); 
                setFirstName(''); 
                addToast('تمت إضافة المستخدم بنجاح.', 'success'); 
            } catch (error: any) { 
                addToast(error.message, 'error'); 
            } 
        } 
    }; 
    return (
        <div className="space-y-8">
            <div className="bg-[#1f2937] p-8 rounded-2xl border border-gray-700/50 shadow-xl">
                <h3 className="text-xl font-bold mb-6 text-[#00FFB0]">إضافة مستخدم جديد</h3>
                <form onSubmit={handleAddAdminSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div className="w-full">
                        <label className="block text-xs font-bold text-gray-400 mb-2">الاسم</label>
                        <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00A7F8] text-white placeholder-gray-600" required/>
                    </div>
                    <div className="w-full">
                        <label className="block text-xs font-bold text-gray-400 mb-2">البريد الإلكتروني</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00A7F8] text-white placeholder-gray-600" required/>
                    </div>
                    <div className="flex gap-4 w-full">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-400 mb-2">كلمة المرور</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00A7F8] text-white placeholder-gray-600" required/>
                        </div>
                        <button type="submit" className="bg-gradient-to-r from-[#00A7F8] to-[#00FFB0] text-black font-bold py-3 px-6 rounded-xl hover:shadow-[0_0_15px_rgba(0,167,248,0.4)] transition-all transform hover:scale-105 h-[48px] mt-auto">إضافة</button>
                    </div>
                </form>
            </div>
            <div className="overflow-x-auto bg-[#1f2937] rounded-2xl border border-gray-700/50 shadow-xl">
                <table className="min-w-full text-sm text-right text-gray-300 whitespace-nowrap">
                    <thead className="bg-gray-800/50 text-xs uppercase font-bold text-gray-400">
                        <tr>
                            <th scope="col" className="px-8 py-4">الاسم</th>
                            <th scope="col" className="px-8 py-4">البريد الإلكتروني</th>
                            <th scope="col" className="px-8 py-4">الدور</th>
                            <th scope="col" className="px-8 py-4">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user:any) => (
                            <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                                <td className="px-8 py-4 font-bold text-white">{user.firstName} {user.lastName || ''}</td>
                                <td className="px-8 py-4">{user.email}</td>
                                <td className="px-8 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === UserRole.Admin ? 'bg-yellow-500/10 text-yellow-400' : 'bg-gray-700 text-gray-400 border-gray-600'}`}>
                                        {user.role === UserRole.Admin ? 'مسؤول' : 'مستخدم'}
                                    </span>
                                </td>
                                <td className="px-8 py-4">
                                    <button onClick={() => onRequestDelete(user.id, user.email)} className="text-red-400 hover:text-red-300 font-bold text-xs bg-red-500/10 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors">حذف</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    ); 
};

export default UserManagementTab;
