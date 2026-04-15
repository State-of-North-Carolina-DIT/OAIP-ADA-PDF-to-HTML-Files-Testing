Modeling the Cape Fear and
Neuse River Basin Operations with OASIS

Addendum to the
User Manual for OASIS with OCLTM

November 2013

Prepared for the
North Carolina Division of Water Resources

[[IMAGE_1_0|HYDROLOGICS logo]]

Advancing the management of water resources

# Table of Contents

| Section | Page |
| :--- | :--- |
| 1 – Introduction | 3 |
| 2 – Model Components | |
| 2.1 Schematic | 5 |
| 2.2 Model Input | 7 |
| 2.3 Run Configurations | 17 |
| 2.4 Model Output | 18 |
| Appendices | |
| A - Model Static Input Data and Run Code | |
| B1 – Finalized Inflow Data Development – Cape Fear | |
| B2 – Finalized Inflow Data Development – Neuse | |
| C– Provisional Inflow Data Development | |
| D – Model Weighting Description | |

# Section 1. Introduction

This report describes how OASIS is used to model the operations of the Cape Fear and Neuse River Basins in North Carolina. Combining previously separate models of each basin into a single model allows for optimizing potential transfers between users in both basins. This application of OASIS, known as the Cape Fear /Neuse Hydrologic Model, extends geographically from the headwaters of the Deep and Haw Rivers to the mouth of the Cape Fear River, and from the headwaters of the Eno, Flat and Little Rivers to the mouth of the Neuse River. This report is not intended to replace the User Manual for OASIS, which is available from the Help menu of the model. Rather, it is intended to document the data used in this application as well as the current operations of the basins. Information about the OASIS platform is included only to the extent necessary to provide context for the application-specific data. 

The model is available for registered users on the Division of Water Resources (DWR) server. The model can be used in two modes: (1) a simulation mode to evaluate system performance for a given set of demands, operating policies, and facilities over the historic inflow record; and (2) a position analysis mode for real-time management. The simulation mode contains two default runs, one for conditions today and one for projected 2050 conditions. In the position analysis mode, the model uses multiple ensemble forecasts to provide a probabilistic assessment of conditions up to one year in the future. Although it can be used for other purposes as well, this feature is particularly useful for drought management. 

The model uses an inflow data set that extends from January 1, 1930 through September 30, 2011. This data set was developed using a comprehensive approach that (1) relies on over 60 streamflow gages in the basins; (2) accounts explicitly for upstream alterations, or impairments, from reservoir regulation and net water consumption; and (3) uses statistical techniques to complete missing records for these gages. 

Real-time drought management requires forecasts of inflow and, as noted below, the forecasts are generated based on inflows through the present day. Updating the inflows requires the collection of impairment data, which can be time intensive. It is envisioned that these data will be collected every five years. In the interim (e.g., through 2017), the inflow data starting October 2011 will be based on a provisional inflow technique so that real-time updates can be made quickly and easily without the need to collect all the impairment data. 

The remainder of this document summarizes the components of the model and the major operations in the basins. Appendix A lists the static input data and run code used in the basecase simulation run that is based on today’s facilities, operations, and year 2010 demands. Appendices B1 and B2 describe the approach used to establish the finalized inflow data set for the Cape Fear and Neuse basins, respectively. Appendix C describes the approach for generating provisional inflows for the basins. Appendix D describes the weighting assigned to the various nodes and arcs so that the model reflects the general priorities for water allocation in the basins.

It is important to note how the OASIS model should and should not be used. OASIS is a generalized type of mass balance model used mainly in evaluating planning and management alternatives. It is not intended for use in hydraulic routing nor flood management, although it can be linked to other models for those purposes. 

In addition, since modeling results are sensitive to inflows, the user must be cautioned about accuracy of the inflows. HydroLogics spent considerable effort in developing the inflow data. The methodology ensures that the monthly naturalized flows at the gage locations match, which assumes that any measurement error is embedded in the impairments and not the streamflow data. DWR agreed to this method, which, although imperfect, is the most reasonable given the available data. Further, it is important to note that we are not trying to replicate history in computing the OASIS inflows; rather, we are trying to build a data set of daily flows whose variation is representative of history while preserving monthly gaged flows as “ground truth”. 

Due partly to the inaccuracy of some of the impairment data and to time of travel, negative inflows may occur. These can lead to potential model infeasibility. The model code filters out negative inflows, particularly large ones, but preserves the total inflow volume over a short period by debiting those negative inflows from subsequent positive inflows. For example, if a rainstorm hits the upstream part of the reach but not the downstream part, the gaged flow data may indicate a large negative inflow (gain) between the upstream and downstream ends. When the flow attenuates upstream and peaks downstream, the inflow becomes positive, and the negative gains from the days before are debited from the positive inflows in the days after to ensure that the average inflow over that period is preserved. The occurrence of negative inflows is reduced in the main-stem of the Neuse and Cape Fear by incorporating time-of-travel equations recommended by the Army Corps of Engineers. These equations are provided in Appendices B1 and B2.

# Section 2. Model Components

## 2.1 Schematic

The model uses a map-based schematic that includes nodes for withdrawals (agricultural, municipal, and industrial), discharges (municipal and industrial), reservoirs, gage locations, and points along the rivers where flows are of interest. Arcs represent means of water conveyance between nodes. The model schematic is shown on the following page and is sized to show the full system. (To make the schematic more legible, the user can adjust the schematic size from the model’s graphical user interface (GUI)). The schematic and associated physical data were developed with input from basin stakeholders at numerous model review meetings. 

In total, the model has approximately 330 nodes and 450 connecting arcs. There are 58 reservoir 42 actual reservoirs, 11 flood impoundments on Crabtree Creek, and five artificial storage nodes used for time-of-travel flow routing), over 60 agricultural demand nodes, over 50 municipal and industrial demand nodes, 25 independent wastewater discharge nodes (i.e., not tied into a water withdrawal node), over 100 natural inflow nodes (including the reservoir nodes), and other miscellaneous nodes to account for minimum flow requirements, interconnections, and instream flow assessment for ecological needs.

[[IMAGE_6_0|Map schematic of the Cape Fear and Neuse River Basins]]

The user can click on any node or connecting arc on the schematic to access specific information, like reservoir elevation-storage-area data or minimum streamflow requirements. These data are also contained in tables contained on other tabs of the model. 

To differentiate between the basins, node numbering up to 999 is assigned to nodes in the Cape Fear Basin, and 1000 up to 1999 to nodes in the Neuse Basin. 

## 2.2 Model Input 

Input data for the model is stored in three forms: static and pattern data, timeseries data, and user-defined data using operations control language (OCL). The timeseries data are stored outside the model run. The other data are embedded in the run and copy over automatically when creating a new run. 

Static and pattern data are contained in the GUI and represent data that do not change during the model simulation (such as physical data like reservoir elevation-storage-area relationships) or repeating data that occurs every year in the simulation (like monthly demand patterns or seasonal minimum release patterns). Timeseries data change with each day in the simulation record and typically consist of inflows and reservoir net evaporation. OCL allows the user to define more elaborate operating rules than are permitted from the GUI. 

### Static and Pattern Data

Tables containing the model’s static and pattern data can be found in Appendix A. Reservoir information includes elevation-storage-area relationships, minimum and maximum allowable storage, and any rule curves which dictate the preferred operating elevation throughout the year. 

Minimum flows and reservoir releases are defined by minimum flow patterns on arcs. 

Water treatment plant and transmission constraints are defined by maximum capacities on arcs. 

Municipal and industrial demand nodes use an annual average demand subject to a monthly pattern, and an associated wastewater discharge based on a fraction of the monthly demand. Wastewater discharges not associated with demand nodes are modeled using an annual average return subject to a monthly pattern. 

The model allows the user to systematically adjust all municipal and industrial demands in the basins by invoking the demand multiplier option on the Setup tab. This is useful when doing sensitivity analyses on the impact of demand growth in the basins. Note that agricultural demands and independent wastewater returns are not adjusted using this multiplier. The agricultural demand can be adjusted as described below, and the independent wastewater returns can be adjusted manually in the pattern tables.

### Timeseries Data

The timeseries data are stored in a basedata timeseries file (basedata.dss), which contains all the inflow and net evaporation (evaporation less precipitation) data. The sources for these data are provided in Appendices B1 and B2 along with a more detailed description of how the inflows were developed. As noted, updating the timeseries data can be done in two ways: (1) using the comprehensive approach described in Appendices B1 and B2; or (2) using the provisional approach for facilitating real-time drought management described in Appendices C1 and C2. The provisional approach relies on data from select gaging and precipitation stations throughout the basins. 

The provisional updates can be done directly from the interface by selecting the Update Record tab. First the user presses the Download Data Button; once the data has downloaded the user needs to check for any blanks or erroneous values. After verifying the data, the inflows can be updated by pressing the Update Record button. The update record algorithm will calculate the inflows to all the OASIS inflow nodes and net evaporation for all reservoir nodes and write them to the basedata.dss file automatically. 

Agricultural water use is modeled as a timeseries over the historic hydrologic record. It is broken out by county and depends on livestock count, crop usage, livestock and crop water consumption, and rainfall. Evapotranspiration equations for each crop are used in conjunction with the timeseries precipitation record so that crops are only irrigated when necessary. The water use can be easily adjusted from the model interface by opening the Edit Agricultural Data dialog box on the Setup tab. The model automatically converts the input data on crop acreage and livestock count into water use values. The agricultural demand nodes are a summation of the agricultural water usage in a particular reach of interest.

### Operating Rules

As described in more detail in Appendix D, most of the water allocation priorities are set by the user in the GUI by applying weights to nodes and arcs. The most common operating rules are for storing water in reservoirs versus releasing the water to meet local demands or minimum releases, and these are reflected by the weighting scheme. Simply stated, if a minimum flow in a river is more important than meeting the local water supply demand, a higher weight on the minimum flow means water supply deliveries will be scaled back if necessary in a drought to meet the minimum flow. 

The Operations Control Language (OCL) allows the user to model more complex operating rules such as drought management protocols that tie demand reductions to reservoir levels or river flows. These files are accessible from the model interface. The OCL files associated with the basecase simulation run that uses year 2010 demands are included in Appendix A. The key OCL files include *main.ocl*, which initializes the run and refers to all the other OCL files; *filter_inflows.ocl*, which filters the inflows for any negative gains in the provisional record; *WW_returns.ocl* which sets the wastewater returns; *routing.ocl*, which routes water to account for time of travel; *Jordan_ops.ocl*, *Jordan_WQ_WS_Accounts.ocl*, *drought_protocol_Jordan.ocl*, *Falls_Bdam_ops.ocl*, *Falls_flood_ops.ocl*, and *Falls_Bdam_WQ_WS_Accounts.ocl*, all of which dictate the operating policies for Jordan Lake and Falls Lake; and *drought_plans_cf.ocl* and *drought_plans_neuse.ocl* which code the Water Shortage Response Plans submitted by utilities in each basin to DWR. A number of other OCL files dictate the operating policies for other systems, and can be found in Appendix A. Appendix D details the weighting which also controls operations in the basins.

A series of stylized flowcharts are provided below summarizing the overall operations of each basin as captured in the model. Note that to simplify the flow diagrams, detailed interconnections captured in the model are not shown here.

## Flow Chart of Major Nodes in the Upper Cape Fear Basin

Reidsville Dam
Old Stony Ck Reservoir
Reservoirs in the Upper Basin are generally set up with a water supply pool to meet demand and a minimum release. The weighting is set up so that they are not impacted by downstream operations.

Reidsville Demand
Lake Brandt
Lake Townsend
Burlington Demand
Graham-Mebane Reservoir
Lake Higgins
Graham-Mebane Demand
Haw River
Greensboro Demand
N. Buffalo Ck
Mackintosh Reservoir
Burlington Mackintosh Demand
Haw River Flow Downstream towards Jordan Lake

Reservoir Node
Demand Node
Junction Node
Flow Arc
Withdrawal Arc
WW Return Arc

## Flow Chart of Major Nodes in the Middle Cape Fear Basin

Haw River Flow from Upstream
Cane Creek Reservoir
OWASA’s operating policy is dictated by OCL (Appendix A). Stone Quarry is used as a backup source to University Lake and Cane Creek Reservoir.
OWASA Demand
University Lake
Stone Quarry
Jordan’s primary demands are from Cary/Apex, RTP, Morrisville, and North Chatham County. Water can also be transferred to Durham and OWASA via Cary. Cary’s wastewater is primarily returned to the Neuse River Basin.
Jordan Demands
Pittsboro Demand
Jordan Lake
Harris Lake
Progress Energy Net WD
Jordan Lake is divided into three zones (sedimentation, conservation, and flood); the model weighting is setup to keep the reservoir in the conservation zone whenever possible. The conservation zone is divided into separate Water Supply and Water Quality Storage accounts. The accounts, which are used to meet water supply demands and minimum release requirements from the dam and at Lillington, are kept track of using the US Army Corps of Engineers (USACE’s) accounting methodology. During a drought, the USACE’s drought protocol is used. When high flows cause the elevation to go into the flood storage zone, an approximation of USACE’s flood policy is enacted. See Appendix A for the OCL containing these operating policies.
Cape Fear Lillington Gage
Deep River Flow from Upstream

Reservoir Node
Demand Node
Junction Node
Flow Arc
Withdrawal Arc
WW Return Arc

## Flow Chart of Major Nodes on the Deep River

High Point Reservoir
High Point Demand
Reservoirs on the Deep River are generally set up with a water supply pool to meet demand and a minimum release. The weighting is set up so that they are not impacted by downstream operations.
Upper Siler City Reservoir
Siler City’s Reservoirs are operated to keep the Lower Reservoir 1 ft below full by releasing water from the Upper Reservoir. There is a minimum release requirement from the Lower Reservoir, including a pulsing regime for certain drawdown levels (see Appendix A).
Lower Siler City Reservoir
Randleman Reservoir
Ramseur Reservoir
Rocky River
Siler City Demand
Ramseur Demand
Randleman Regional Demands
Deep River
Flow to the Cape Fear downstream of Jordan

Reservoir Node
Demand Node
Junction Node
Flow Arc
Withdrawal Arc
WW Return Arc

## Flow Chart of Major Nodes in the Lower Cape Fear Basin

Flow from Upstream at Lillington
Harnett Co. Demand
Dunn Demand
Wilmington & Lower Cape Fear WASA Demands
Fayetteville Demand
Cape Fear Tar Heel Gage
Glenville Reservoir
Cape Fear Kelly Gage
Model Terminus

Reservoir Node
Demand Node
Junction Node
Flow Arc
Withdrawal Arc
WW Return Arc

## Flow Chart of Major Nodes in the Upper Neuse Basin

West Fork Eno Reservoir
Lake Orange
The model weighting of reservoirs is set to allow minimum releases to be made for instream flow requirements and withdrawals, but not for any needs downstream.
Beaverdam Lake shares a pool with Falls above 249 ft. In the model a two-way arc allows water above this level to merge with the Falls pool. During a drought, provisions are included to allow releases from Beaverdam into Falls, as dictated by USACE policy.
Lake Michie
Minimum release requirements from Lake Orange and WFER are dictated by Capacity Use Area Rules (see Appendix A). The rules are in place to maintain minimum flows downstream at the Hillsborough gage, and are set based on time of year, lake levels, and the flow at the gage. Water supply withdrawals may also be limited based on the same criteria.
Hillsborough Demand
Little River Reservoir
Durham Demand
Falls Lake is divided into three zones (sedimentation, conservation, and flood); the model weighting is setup to keep the reservoir in the conservation zone whenever possible. The conservation zone is divided into separate Water Supply and Water Quality Storage accounts. The accounts, which are used to meet water supply demands and minimum release requirements, are kept track of using the USACE’s accounting methodology. When high flows cause the elevation to go into the flood storage zone, the USACE’s flood policy is enacted.
The minimum release requirement from Little River Reservoir is set according to time of year and reservoir storage.
Eno Hillsborough Gage
Eno Durham Gage
Beaverdam Lake
Falls Lake
Raleigh Demand
Minimum release requirements from Falls Lake are dictated by time of year. Water for the release (and for the downstream Clayton target) is taken from the Water Quality account.
Raleigh WD from Swift Creek
Neuse Clayton Gage

Reservoir Node
Demand Node
Junction Node
Flow Arc
Withdrawal Arc
WW Return Arc

## Flow Chart of Major Nodes in the Middle Neuse Basin

11 flood impoundments are modeled on Crabtree Creek to accurately capture the flow reaching the Neuse.
Flow from Falls Lake
Crabtree Creek Flood Impoundments
Johnson Co. & Smithfield Demand
Not pictured: Johnston County’s offline storage quarries.
Raleigh WD
Lake Wheeler
Swift Creek
Neuse Clayton Gage
Flow from Little River
Lake Benson
Raleigh utilizes Lakes Wheeler and Benson for water supply; water is withdrawn from Benson, and water is released from Wheeler to maintain Benson at least 2 ft below the normal pool. There is also a minimum release requirement from Benson.
Flow from Middle Creek
Neuse Goldsboro Gage
Goldsboro Demand
Flow downstream to Kinston

Reservoir Node
Demand Node
Junction Node
Flow Arc
Withdrawal Arc
WW Return Arc

## Flow Chart of Major Nodes in the Lower Neuse Basin

Buckhorn Reservoir
Water from Buckhorn Reservoir is used to meet Wilson Demand downstream on Contentnea Creek. Buckhorn also has a minimum release requirement.
Flow from Goldsboro
Wilson Demand
Contentnea Creek
Neuse Kinston Gage
Lower Neuse WASA Demand
Model Terminus

Reservoir Node
Demand Node
Junction Node
Flow Arc
Withdrawal Arc
WW Return Arc

## 2.3 Run Configurations 

The model can be used in two modes: (1) a simulation mode to evaluate system performance for a given set of demands, operating policies, and facilities over the historic inflow record; and (2) a position analysis mode for real-time management. General information on creating, modifying, and executing runs is provided in the User Manual for OASIS, which is available from the Help menu of the model. 

### Simulation: 

In simulation mode, on the Setup tab, the user can select from three radio buttons: No Forecasts, Conditional Forecasts, and Non-conditional Forecasts. The latter two enable the user to evaluate forecast-based operating policies (although none are used in the basecase scenario), with inflow forecasts generated for each week in the historical inflow record. Conditional forecasts account for antecedent flow conditions while non-conditional forecasts are made independent of how wet or dry the basin is. The forecasts for the simulation mode are generated outside the GUI and stored in the basedata folder. The current forecast file is developed from the timeseries *basedata.dss* file that extends through September 2011. The forecast file should only be updated in conjunction with the comprehensive inflow updates (anticipated every five years with the next update in 2017).

To enable all utility drought plans in a run, set the *Drought Plans On* variable in the OCL Constants Table to 1. A value of 0 will turn all drought plans off.

The GUI allows for all municipal and industrial demands in the model to be uniformly increased or decreased by a user-specified fraction. To enable the demand multiplier, check the *Use Multiplier* box on the Setup tab, and enter a number in the *Multiplier Value* box. For example, setting the value to 0.9 will decrease all M&I demands by 10%, and setting it to 1.1 will increase them by 10%.

### Position Analysis:

In position analysis mode, the user can select from Conditional or Non-Conditional Forecasts on the Setup tab. By executing a run, the model will produce a forecast (typically of river flows or reservoir elevations) for up to the next 365 days. A forecast can be made on any date in the historic inflow record or no more than one day after the end of the inflow record. Typically it will be used starting the day after the last update of the inflow and net evaporation record. For example, if these records end September 30, 2011, the user can run a forecast for October 1, 2011. If a month has passed, and the user wants to run a forecast for November 1, 2011, the user would update the inflows and net evaporation for October using the Update Record tab and then start the position analysis run on November 1. For a reservoir, or locations affected by the operation of a reservoir upstream, the forecast is dependent on the starting elevation of the reservoir. On the Setup tab, the user simply inputs the starting elevation (or storage), the starting date of the forecast run, and clicks Run. Note that initial storage values for the water supply and quality accounts for Jordan and Falls Lakes are handled differently, with those set in the constants table accessible from the GUI.

## 2.4 Model Output 

The model allows the user to customize output files (tables or plots) and save them for routine use. Alternatively, the user can click on any node or arc on the schematic or go to the Setup tab and select Quick View to access and save tabular or plotted output. A number of tables and plots have been provided for points of interest in the basins. The balance sheet can also serve as a useful tool for tracking water through the system. 

Included in the model output tables is a file called *xQy_ClimaticYear_Clayton.1v*. This file allows the user to compute instream flow statistics, such as 7Q10, for a specific site, in this case the Neuse River at Clayton gage. To generate statistics for a different site, the user would copy and rename the file, then change the name and associated arc listed in the file. When viewing the generated output, the default layout shows two columns, for 7- and 30-day low flows (these periods can be changed in the .1v file). Scrolling to the bottom of the output file shows Log Pearson percentiles for each column. If the user is interested in the 7Q10 (7-day low flow, 10th percentile) flow, the user would look at the first column, and the row labeled LPrs.100.

In addition, the model is capable of automatically determining the safe yield for a specific demand node, in this case the demand from Falls Lake. To generate statistics for a different site, the user would copy and rename the file (currently called *SafeYield_Raleigh.1v*), then change the name and associated demand node listed in the file. The safe yield can be determined for each year in the historic inflow record (annual safe yield analysis) or for the entire period of record. The user inputs the adjustment criteria by selecting the Run Safe Yield Analysis button on the Setup tab. The safe yield routine works by tracking demand shortages for the chosen demand node, and iteratively works towards the maximum demand that produces no shortages from the supply source (in this example, Falls Lake). Note under the current output file configuration, the drought plans should be turned off when using the safe yield routine, as the demand reductions resulting from drought restrictions inherently produce a ‘shortage’ from the normal demand. The output file configuration can be modified if needed for the specific drought plan of each system.
