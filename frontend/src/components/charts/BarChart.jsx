import {
    BarChart as ReBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

const BarChart = ({ data, name }) => {
    return (
        <div className="card shadow-sm h-100">
            <div className="card-header bg-white fw-semibold">
                {name}
            </div>

            <div
                className="card-body"
                style={{ height: "320px" }}
            >
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <ReBarChart
                        data={data}
                        margin={{
                            top: 20,
                            right: 20,
                            left: 0,
                            bottom: 5
                        }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                        />

                        <XAxis
                            dataKey="ay"
                        />

                        <YAxis />

                        <Tooltip />

                        <Bar
                            dataKey="randevu"
                            radius={[6, 6, 0, 0]}
                        />
                    </ReBarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default BarChart;