const chartContainer = document.getElementById("chart");
const margin = { top: 20, right: 30, bottom: 50, left: 60 };
const width = document.getElementById("chart").offsetWidth - 40; 
const height = 400;

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .style("border", "1px solid #ccc");

const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const xScale = d3.scaleLinear().range([0, width]);
const yScale = d3.scaleLinear().range([height, 0]);

svg.append("text")
    .attr("transform", `translate(${width / 2},${height + margin.bottom - 10})`)
    .style("text-anchor", "middle")
    .text("Tuition Cost (Out-of-State)");

svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20)
    .attr("x", -height / 2)
    .style("text-anchor", "middle")
    .text("Graduation Rate (%)");

const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

let data = [];

d3.csv("college_data.csv").then(rawData => {
    data = rawData.map(d => ({
        College: d.College,
        Private: d.Private,
        Outstate: +d.Outstate,
        "Grad.Rate": +d["Grad.Rate"]
    })).filter(d => d["Grad.Rate"] <= 100);

    xScale.domain([0, d3.max(data, d => d.Outstate)]);
    yScale.domain([0, d3.max(data, d => d["Grad.Rate"])]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    updatePlot(data);

}).catch(error => {
    console.error("Error loading the CSV data:", error);
});

function updatePlot(filteredData) {

    const circles = svg.selectAll("circle")
        .data(filteredData, d => d.College);

    circles.enter()
        .append("circle")
        .attr("cx", d => xScale(d.Outstate))
        .attr("cy", d => yScale(d["Grad.Rate"]))
        .attr("r", 5)
        .attr("fill", "steelblue")
        .on("mouseover", function (event, d) {
            d3.select(this)
                .attr("stroke", "black")
                .attr("stroke-width", 2);

            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`<strong>${d.College}</strong><br>Tuition: $${d.Outstate}<br>Graduation Rate: ${d["Grad.Rate"]}%`)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseout", function () {
            d3.select(this)
                .attr("stroke", null);

            tooltip.transition().duration(200).style("opacity", 0);
        })
        .merge(circles)
        .transition()
        .duration(500)
        .attr("cx", d => xScale(d.Outstate))
        .attr("cy", d => yScale(d["Grad.Rate"]));

    circles.exit()
        .transition()
        .duration(500)
        .attr("r", 0)
        .remove();
}

document.getElementById("showAll").addEventListener("click", () => {
    updatePlot(data);
});

document.getElementById("privateOnly").addEventListener("click", () => {
    updatePlot(data.filter(d => d.Private === "Yes"));
});

document.getElementById("publicOnly").addEventListener("click", () => {
    updatePlot(data.filter(d => d.Private === "No"));
});