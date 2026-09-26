"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [role, setRole] = useState("");
  const [summary, setSummary] = useState<any>({});
  const [classes, setClasses] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/");
    setRole(localStorage.getItem("role") || "");

    const fetchDashboard = async () => {
      const headers = { Authorization: `Bearer ${token}` };

      const sumRes = await fetch(
        "http://localhost:3001/api/attendance/summary",
        { headers },
      );
      setSummary(await sumRes.json());

      const classRes = await fetch("http://localhost:3001/api/classes", {
        headers,
      });
      setClasses(await classRes.json());
    };
    fetchDashboard();
  }, [router]);

  const markAttendance = async (
    classId: number,
    studentId: number,
    status: string,
  ) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3001/api/attendance/mark`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        classId,
        studentId,
        date: new Date().toISOString().split("T")[0],
        status,
      }),
    });
    alert(`Attendance marked!`);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Attendance Dashboard ({role})</h1>
        <button
          onClick={() => {
            localStorage.clear();
            router.push("/");
          }}
          className="text-red-500"
        >
          Logout
        </button>
      </div>
      <div className="bg-white p-6 shadow rounded mb-8">
        <h2 className="text-xl font-bold mb-2">Analytics Summary</h2>
        {role === "Admin" && (
          <p>Global Present Rate: {summary.totalPresentRate?.toFixed(1)}%</p>
        )}
        {role === "Teacher" && (
          <p>
            Total Records Managed: {summary.totalRecords} (Present:{" "}
            {summary.present})
          </p>
        )}
        {role === "Student" && (
          <p>
            Your Attendance Percentage:{" "}
            {summary.attendancePercentage?.toFixed(1)}%
          </p>
        )}
      </div>
      <h2 className="text-xl font-bold mb-4">Classes</h2>
      <div className="grid gap-4">
        {classes.map((cls: any) => (
          <div key={cls.id} className="bg-white p-4 shadow rounded">
            <h3 className="text-lg font-bold">{cls.name}</h3>
            {role === "Teacher" && cls.student_ids && (
                <div className="mt-4">
                    <p className="font-semibold text-sm text-gray-600 mb-2">Mark Todays Attendance:</p>
                    {cls.student_ids.map((studentId: number) => (
                        <div key={studentId} className="flex items-center gap-2 mb-2">
                            <span className="text-sm">Student ID: {studentId}</span>
                            <button
                                onClick={() => markAttendance(cls.id, studentId, "Present")}
                                className="bg-green-100 text-green-700 px-2 rounded text-sm"
                            >
                                Mark Present
                            </button>
                            <button
                                onClick={() => markAttendance(cls.id, studentId, "Absent")}
                                className="bg-red-100 text-red-700 px-2 rounded text-sm"
                            >
                                Mark Absent
                            </button>
                        </div>
                    ))}
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
