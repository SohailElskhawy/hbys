import {
    PieChart as RePieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

const COLORS = ["#0d6efd", "#198754", "#ffc107", "#dc3545", "#6f42c1"];

const PieChart = ({ data, name }) => {
    return (
        <div className="card shadow-sm h-100">
            <div className="card-header bg-white fw-semibold">
                {name}
            </div>

            <div className="card-body" style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            label={({ percent }) =>
                                `${(percent * 100).toFixed(0)}%`
                            }
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={entry.name}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>

                        <Tooltip />
                        <Legend />
                    </RePieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PieChart;