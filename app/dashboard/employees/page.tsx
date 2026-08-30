"use client"

import { useState } from "react"
import { Users, Plus, Search, Mail, Briefcase, X, Save, Trash2 } from "lucide-react"

// Define the structure of an Employee
interface Employee {
  id: string
  name: string
  role: string
  email: string
  department: string
}

export default function EmployeesPage() {
  // Start with an empty list. No fake data!
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // State to control the "Add Employee" form
  const [isFormOpen, setIsFormOpen] = useState(false)

  // State to hold the new employee's details
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    role: "",
    email: "",
    department: ""
  })

  // Handle input changes in the form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewEmployee(prev => ({ ...prev, [name]: value }))
  }

  // Save the new employee to the list
  const handleSaveEmployee = () => {
    if (!newEmployee.name || !newEmployee.email) {
      alert("Name and Email are required!")
      return
    }

    const employee: Employee = {
      id: Date.now().toString(), // Generate a unique ID
      ...newEmployee
    }

    setEmployees([...employees, employee])

    // Reset form and close it
    setNewEmployee({ name: "", role: "", email: "", department: "" })
    setIsFormOpen(false)
  }

  // Delete an employee from the list
  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id))
  }

  // Filter employees based on search query
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      {/* Header */}
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
        People · Employees
      </p>
      <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
        Employees
      </h1>
      <p className="text-muted max-w-xl mb-12">
        Your team, their roles, and the handovers in progress.
      </p>

      {/* Action Bar: Search + Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by name, role, or department..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border hairline bg-white/50 focus:outline-none focus:border-brown text-brown placeholder:text-muted transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-6 py-3 bg-brown text-cream-deep rounded-2xl hover:bg-brown/90 transition-colors flex items-center justify-center gap-2 font-mono text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Add Employee Form (Shows only when isFormOpen is true) */}
      {isFormOpen && (
        <div className="rounded-2xl border hairline bg-cream-deep/40 p-6 mb-8 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-2xl text-brown italic">New Team Member</h2>
            <button onClick={() => setIsFormOpen(false)} className="text-muted hover:text-brown">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-mono text-muted mb-2">FULL NAME *</label>
              <input
                type="text"
                name="name"
                value={newEmployee.name}
                onChange={handleInputChange}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted mb-2">EMAIL ADDRESS *</label>
              <input
                type="email"
                name="email"
                value={newEmployee.email}
                onChange={handleInputChange}
                placeholder="e.g. john@company.com"
                className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted mb-2">ROLE / JOB TITLE</label>
              <input
                type="text"
                name="role"
                value={newEmployee.role}
                onChange={handleInputChange}
                placeholder="e.g. Software Engineer"
                className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted mb-2">DEPARTMENT</label>
              <input
                type="text"
                name="department"
                value={newEmployee.department}
                onChange={handleInputChange}
                placeholder="e.g. Engineering"
                className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsFormOpen(false)}
              className="px-6 py-2 text-sm font-mono text-muted hover:text-brown transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEmployee}
              className="px-6 py-2 bg-brown text-cream-deep rounded-xl hover:bg-brown/90 transition-colors flex items-center gap-2 font-mono text-sm font-semibold"
            >
              <Save className="w-4 h-4" />
              Save Employee
            </button>
          </div>
        </div>
      )}

      {/* Employee List */}
      <div className="space-y-4">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className="rounded-2xl border hairline bg-cream-deep/40 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brown/50 transition-all group"
            >
              {/* Left: Avatar & Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brown/10 flex items-center justify-center text-brown font-display text-xl italic group-hover:bg-brown group-hover:text-cream-deep transition-colors">
                  {employee.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-display text-xl text-brown italic">
                    {employee.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Briefcase className="w-3 h-3 text-muted" />
                    <span className="text-sm text-muted font-mono">
                      {employee.role || "No Role"} · {employee.department || "No Department"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Contact & Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted" />
                  <span className="text-sm text-brown font-mono">{employee.email}</span>
                </div>

                <button
                  onClick={() => handleDeleteEmployee(employee.id)}
                  className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Employee"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="rounded-2xl border hairline border-dashed border-cream-deep p-12 text-center">
            <Users className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-brown font-display text-xl italic mb-2">
              {searchQuery ? "No employees match your search." : "Your team is empty."}
            </p>
            <p className="text-sm text-muted">
              {searchQuery ? "Try adjusting your search query." : "Click 'Add Employee' to get started."}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}