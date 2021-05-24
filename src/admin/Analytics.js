import React from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

/**
 * @author
 * @function AnalyticsHome
 **/

const AnalyticsHome = props => {
  //chart code
  am4core.useTheme(am4themes_animated);
  let chart = am4core.create("chartdiv", am4charts.XYChart);
  chart.padding(40, 40, 40, 40);
  return <div>AnalyticsHome</div>;
};

export default AnalyticsHome;
