# NORTH CAROLINA DEPARTMENT OF ENVIRONMENTAL QUALITY

## NCDEQ RISK CALCULATOR USER GUIDE

[[IMAGE_1_0|NCDEQ Logo]]

NORTH CAROLINA 
DEPARTMENT OF ENVIRONMENTAL QUALITY 
NCDEQ RISK CALCULATOR 
USER GUIDE 
February 2024

## TABLE OF CONTENTS

1.0 INTRODUCTION ............................................................................................................... 1
1.1 Scope and Application .................................................................................................... 1
1.2 Risk Calculator Cell Color Codes ................................................................................... 1
2.0 SITE CHARACTERIZATION ............................................................................................ 2
2.1 Physical Setting and Site Contamination ........................................................................ 2
2.2 Exposure Pathways ......................................................................................................... 2
2.3 Receptors......................................................................................................................... 3
2.4 Exposure Units ................................................................................................................ 3
3.0 USING THE RISK CALCULATOR................................................................................... 4
3.1 Project Information and Report Organization ...................................................................... 6
3.1.1 Cover Page ............................................................................................................................ 6
3.1.2 Table of Contents .................................................................................................................. 7
3.1.3 Select Sheets to Print ............................................................................................................. 8
3.2 Links ............................................................................................................................... 8
3.2.1 NCDEQ Risk Calculator User Guide .................................................................................... 8
3.2.2 What’s New ......................................................................................................................... 8
3.2.3 Risk Evaluation Equations and Calculations ........................................................................ 9
3.2.4 Preliminary Soil Remediation Goals Table ........................................................................... 9
3.2.5 Vapor Intrusion Screening Level Tables ............................................................................... 9
3.3 Data Input Sheets ............................................................................................................ 9
3.3.1 Complete Exposure Pathways ............................................................................................... 9
3.3.2 Exposure Factors and Target Risks ..................................................................................... 12
3.3.3 Contaminant Migration Parameters .................................................................................... 14
3.3.4 Sample Statistics ................................................................................................................. 15
3.3.5 Data Input - Exposure Point Concentrations ....................................................................... 15
3.4 Data Output Sheets ....................................................................................................... 17
3.4.1 Summary Output for All Calculators .................................................................................. 17
3.4.2 Direct Contact Soil and Water Calculators ......................................................................... 18
3.4.3 Vapor Intrusion Calculators ................................................................................................ 19
3.4.4 Sitewide Risk Summary ...................................................................................................... 21
3.5 Contaminant Migration Worksheets ............................................................................. 22
3.5.1 Soil Leaching to Groundwater Calculations ....................................................................... 22
3.5.2 Groundwater Migration Calculations .................................................................................. 24
3.5.3 Surface Water Dilution Calculations .................................................................................. 25
3.5.4 Model Verification for Transport Pathways ....................................................................... 25
3.6 Unprotect All Sheet and Protect All Sheets .................................................................. 26
4.0 CALCULATING CLEANUP LEVELS ............................................................................ 26
4.1 Remedial Goals for Direct Contact Pathways .............................................................. 27
4.2 Remedial Goals for Indoor Inhalation Pathways .......................................................... 27
5.0 REPORTING ..................................................................................................................... 27
6.0 REFERENCES .................................................................................................................. 29

## ACRONYMS AND ABBREVIATIONS

| Acronym | Definition |
|---|---|
| ASTM | American Society for Testing and Materials |
| Csat | Soil Saturation Concentration. The Csat is the contaminant concentration above which the contaminant may be present in free phase (non-aqueous-phase liquid or solid). |
| DWM | Division of Waste Management |
| NAPL | Non-aqueous-phase liquid |
| NC | Pathway not complete, an abbreviation used in the calculator output to indicate that the pathway was not checked as complete. |
| NCAC | North Carolina Administrative Code |
| NCDEQ | North Carolina Department of Environmental Quality |
| NM | Not modeled, an abbreviation used in the calculator to indicate that a required parameter was not entered for the calculation. |
| OSHA | Occupational Safety and Health Administration. |
| PQL | Practical Quantitation Limit |
| PSRG | Preliminary Soil Remediation Goal |
| RAGS | Risk Assessment Guidance for Superfund |
| RSL | Regional Screening Level |
| USEPA | United States Environmental Protection Agency |
| VISL | Vapor Intrusion Screening Level |

For questions related to information presented in this user guide, please contact:

Janet Macdonald
(919) 707-8349
janet.macdonald@deq.nc.gov

or

David Lilley
(919) 707-8241
david.lilley@deq.nc.gov

Division of Waste Management
North Carolina Department of Environmental Quality
217 W. Jones Street
1646 Mail Service Center
Raleigh, North Carolina 27699

## 1.0 INTRODUCTION

The North Carolina Department of Environmental Quality (NCDEQ) Risk Calculator is an Excel-based, menu-driven program. The risk evaluation procedures, equations, and default parameters used to create the calculator follow current United States Environmental Protection Agency (USEPA) risk assessment guidance. Refer to the Risk Evaluation Resources page on the NCDEQ Risk-Based Remediation website for a link to the list of equations and default parameters used in the calculator.

[[IMAGE_5_0|]]
[[IMAGE_5_1|Sidebar: In addition to risk-based remediation for site closure, the Risk Calculator has also proven useful in delineating soil contamination, refining excavation limits, determining the quality of imported fill or exported soil, directing vapor intrusion evaluations, and siting monitoring wells for assessment.]]

The Risk Calculator incorporates a database that contains toxicity values and other chemical-specific parameters obtained directly from the USEPA Regional Screening Level (RSL) Tables. The Risk Calculator will be updated when the RSL tables are updated by USEPA, typically semiannually.

This User Guide describes the data needs and functionality of the Risk Calculator and provides instructions on its use. For general procedures on how to use these risk assessment results to implement a risk-based remedy according to N.C.G.S 130A-310.65 through 310.77, refer to the Technical Guidance for Risk-Based Environmental Remediation of Sites.

### 1.1 Scope and Application

The Risk Calculator and associated procedures have been developed to be used together to provide a quick, easy, and conservative method to quantify the potential human health risk posed by exposure to contaminated media. As such, both the parameters incorporated into the calculator and the user inputs are very conservative. **If the DEQ Risk Calculator is used with guidance or procedures outside those found in this document, it is likely the results will not be accepted by DEQ.** After an initial run of the calculator using the default user inputs, a limited number of adjustments are available to the user with DEQ approval. While this tool and method is appropriate for many sites, those requiring a more customizable approach, such as National Priorities List or Federal Facilities sites, would be encouraged to use EPA procedures outlined in the Risk Assessment Guidance for Superfund (RAGS) series and associated guidance, which allow for a greater range of user inputs and flexibility.

### 1.2 Risk Calculator Cell Color Codes

| Color | Description |
|---|---|
| (Yellow) | Data entry field. All other cells are locked and cannot be changed by the user |
| (Orange) | Non-volatile chemical* |
| (Green) | Soil concentration exceeds the soil saturation concentration, Csat |
| (Grey) | Entry not required for pathways selected |
| **Red text** | An entry has been modified from the default value, or no defaults are established |

* Chemical with a Henry's Law constant less than or equal to 1 x 10⁻⁵ atm-m³/mole or a vapor pressure less than or equal to 1 mm Hg.

## 2.0 SITE CHARACTERIZATION

### 2.1 Physical Setting and Site Contamination

Prior to evaluating the risk posed by a contaminated site, a comprehensive site assessment must be completed, and the following should be documented.

1. Full delineation of the horizontal and vertical extent of contamination in all media. Concentration trends over time should be presented, if available.
2. Geology, hydrogeology, preferential flow paths, and other features influencing the movement of contaminants.
3. Analytical results for all media used in the risk assessment. Data should be sorted by medium.

### 2.2 Exposure Pathways

An exposure pathway has five parts: a source and release of contamination, a contaminant transport mechanism, a point of exposure, an exposure route, and a receptor population. When all five parts are present, the exposure pathway is complete. Conversely, if an element in an exposure pathway is missing or removed (e.g., through remediation or institutional controls), the pathway is rendered incomplete.

The user must identify the site-specific exposure pathways that are or may be complete under current or reasonably anticipated future conditions. The following graphic illustrates common exposure pathways.

[[IMAGE_6_0|Flowchart of Potential Exposure Pathways]]

### 2.3 Receptors

Receptors are represented by the following designated land uses:

- Residential – Includes single-family homes, townhouses, apartment buildings, and college/university dormitories. These are areas where both children and adults are expected to spend most of their time. Child/daycare facilities, schools through high school, hospitals, and churches are also considered residential.
- Non-residential – Includes office buildings and commercial/industrial facilities where adult workers routinely spend a significant part of their day. Colleges and universities (excluding dormitories) are considered non-residential. Facilities with chemical exposures that fall under the purview of the Occupational Safety and Health Administration (OSHA) should have those risks evaluated separately. As stated in the DWM Vapor Intrusion Guidance document, “If OSHA standards currently govern the amount of chemical allowed in indoor air, future exposures from subsurface contamination should be evaluated using soil gas data to account for potential changes in use of the building or changes in land use”.
- Construction Worker – Assumes that adult construction/utility workers are exposed to soils through large-scale redevelopment activities that disturb at least ½ acre of contaminated soil. The associated exposure parameters assume a shorter exposure duration and higher exposure relative to residential and non-residential worker scenarios.
- Recreator – Assumes a total exposure time of 26 years, 6 years as a child (0 to 6 years old) and 20 years as an adult (6 to 26 years old). With DWM approval, these exposure durations can be adjusted for situations where a 26-year exposure duration would not be feasible, such as 4-year housing rotations at a military base.
- Trespasser –Assumes an exposure of an adolescent for a duration of 10 years (6 to 16 years old). This pathway should be evaluated at unsecured properties, undeveloped properties, or properties with open space.

### 2.4 Exposure Units

While some properties may be best evaluated as a single unit, others, such as those covering a large areal extent, may be divided into smaller sections. Risk would then be evaluated separately for each section, or exposure unit. Dividing a site into exposure units allows evaluation of specific sub-areas that may require different sets of engineered or institutional controls. Current risk to identified receptors should be evaluated as well as future risk to potential future land-use scenarios, e.g., vacant land could one day have a residence or business where people could be exposed to contaminated soil or groundwater, or harmful vapors in indoor air. Where risks are unacceptable in a given exposure unit or section of the property, engineered controls and/or land-use restrictions are imposed to mitigate those risks.

The following example shows multiple exposure units across a site and the current/potential exposure pathways associated with each.

**Example site with multiple Exposure Units**

[[IMAGE_8_0|Example site diagram with multiple Exposure Units A, B, C, D]]

**Pathways and Receptors for Example Exposure Units**

| Exposure Unit | Contaminated Media | Current/Future | Receptor |
|---|---|---|---|
| A | Soil | Current | Non-residential Worker, Trespasser |
| A | Soil | Future | Resident |
| A | Groundwater | Future | Resident, Non-Residential Worker |
| A | Indoor Air | Future¹ | Resident, Non-Residential Worker |
| A | Groundwater Migration | Future² | Potential Water Supply Well on Uncontaminated Property(ies) |
| B | Groundwater | Future | Resident and Non-Residential Worker |
| B | Indoor Air | Current | Non-residential Worker |
| B | Indoor Air | Future¹ | Resident |
| C | Groundwater | Future | Resident and Non-Residential Worker |
| C | Indoor Air | Future¹ | Resident and Non-Residential Worker |
| D | Groundwater | Current | Resident |
| D | Indoor Air | Current | Resident |

¹ When no structures are present, future indoor air risk should be evaluated using soil gas data.
² Contaminant migration modules in the calculator are used to predict movement of contaminants to a known or hypothetical receptor (such as to a property where a water supply well may be installed).

## 3.0 USING THE RISK CALCULATOR

Download the latest version of the Risk Calculator from the Risk-Based Remediation Website. Due to the complexity of the Risk Calculator, a few minutes may be needed to complete the download. Also, you may receive a security message that the macros are blocked from running because the source of this file is untrusted. Always download the Risk Calculator to your hard drive and set the location on the hard drive as a “trusted location” in the Excel Trust Center. Then click “Enable Content” if there is an option to do so at the top of the file. Once downloaded, the Risk Calculator opens to the “Main Menu” page. The entire functionality of the Risk Calculator is displayed in the Main Menu page and is organized in five general sections.

[[IMAGE_9_0|Screenshot of Risk Calculator Main Menu]]

- Project information and report-making
- Links to important references
- Exposure pathway selection, default input values and site-specific data entry
- Risks for each pathway
- Contaminant migration calculations

### 3.1 Project Information and Report Organization

This section is optional and includes sheets to add project information and prepare a report of key risk assessment results with a cover page and table of contents.

#### 3.1.1 Cover Page

The first button on the “Main Menu” takes the user to the “Cover Page” where the applicable site and exposure unit information can be entered in the yellow data entry cells, where it is automatically carried forward to the other sheets.

[[IMAGE_10_0|Screenshot of Cover Page navigation buttons]]

[[IMAGE_10_1|Screenshot of Cover page data entry fields]]

- Shortcut buttons allow the user to return to the main menu, print, or proceed to the next/previous sheet at any step.
- The print button will print the current sheet.
- NCDEQ Risk Calculator version and date of the EPA Regional Screening Level table used in the risk calculations.
- Cells for data entry are highlighted yellow. All other cells are locked and can only be edited by NCDEQ
- Enter site information here. The Site ID and Exposure Unit ID are automatically carried forward to the other sheets.

#### 3.1.2 Table of Contents

The “Table of Contents” sheet is optional. The check boxes are not linked to any other functions in the Risk Calculator, so completion of this sheet has no effect on the calculations.

[[IMAGE_11_0|Screenshot of Table of Contents navigation buttons]]

[[IMAGE_11_1|Screenshot of Table of Contents sheet showing check boxes]]

- Check boxes to compile the report with the pertinent sheets (optional).
- Site ID and Exposure Unit ID must be entered on the Cover Page to be carried through to remaining sheets.

#### 3.1.3 Select Sheets to Print

[[IMAGE_12_0|Screenshot of Select Sheets to Print buttons]]

The “Select Sheets to Print” button is used to select the sheets to print in one batch. There is the option to print individual sheets at each step in lieu of the batch print option. **There is no option in this window to select the printer. The correct printer should be selected through Excel’s File>>Print menu**.

[[IMAGE_12_1|Screenshot of print selection dialog box]]

Check the boxes to print the desired sheets.

### 3.2 Links

This section contains instructional, historical, and supporting information for the risk calculator.

#### 3.2.1 NCDEQ Risk Calculator User Guide

Takes the user to the web page with the latest version of the NCDEQ Risk Calculator User Guide.

#### 3.2.2 What’s New

Takes the user to the web page with a history of the Risk Calculator updates. This section is updated semiannually as the calculator is updated.

#### 3.2.3 Risk Evaluation Equations and Calculations

Takes the user to the web page for the NCDEQ document containing all the equations and inputs used in the Risk Calculator.

#### 3.2.4 Preliminary Soil Remediation Goals Table

Takes the user to the web page containing the NCDEQ Preliminary Soil Remediation Goals (PSRG) Table in pdf format. An excel version is also available at the NCDEQ Risk Evaluation Resources page. **The user must first read the General Notes Section that precedes the table**. PSRGs are provided for residential and industrial/commercial exposure scenarios, as well as protection of groundwater.

#### 3.2.5 Vapor Intrusion Screening Level Tables

The Residential and Non-Residential Vapor Intrusion Screening Level (VISL) Tables are located within the calculator. Although outdated versions may still be found on-line, users are expected to use the latest VISL tables provided in the most up to date version of the Risk Calculator.

### 3.3 Data Input Sheets

This section contains multiple sheets for the user to enter the site-specific exposure pathways, aquifer properties, and contaminant concentrations in each medium.

#### 3.3.1 Complete Exposure Pathways

[[IMAGE_13_0|Screenshot of Complete Exposure Pathways buttons]]

The user should select the current and potential future exposure pathways identified as complete by checking the pertinent boxes on the “Complete Exposure Pathways” sheet. If a pathway is not checked, the risk assessment result will report “NC” (Not Complete) on the “Output Sheet”.

[[IMAGE_14_0|Screenshot of Complete Exposure Pathways checklist]]

- The common pathways will automatically be checked. User should confirm applicability.
- Human Health Risk Pathways.
- Contaminant Transport Pathways.

##### Human Health (Direct Contact) Pathway Considerations

###### Soil

Since surface soil contamination can pose a risk to all human receptors and deeper soil contamination may only pose a risk to construction/utility workers, specific soil depth intervals may need to be evaluated separately. The selection of specific depth intervals should be documented and justified.

**Construction Worker Scenario:**
Construction-related exposures depend on many parameters, including the size of the site, the size of the contaminated source area, the dimensions of the building(s) being constructed and location relative to the source area and to the site boundary, the type of building being constructed (e.g., a slab-on-grade structure versus a building with a basement), and the overall duration of the construction project.

Emissions of both volatiles and particulate matter from contaminated soils increase the inhalation risk to construction workers relative to that of other outdoor receptors. In some cases, a higher risk could be calculated for a construction worker than for residential receptors. As a result, the risk to construction workers should not drive remediation decisions but be used to help guide safety concerns for construction activities.

###### Sediment

Sediment exposure is determined using the same equations and defaults as soil, so any sediment data should be entered as soil.

###### Groundwater

The direct contact with groundwater pathway calculates the risk of using private well water for drinking, cooking, and bathing. To predict whether groundwater or a water supply well will become contaminated due to contaminant migration, use the contaminant migration worksheets at the bottom of the Main Menu as further discussed below.

[[IMAGE_15_1|Sidebar: The calculator can be used to dictate the next phase of data collection in a vapor intrusion evaluation, i.e., if soil gas risk is unacceptable, then indoor air sampling is warranted.]]
[[IMAGE_15_3|Sidebar: Risk-based groundwater remedies (site-specific cleanup levels) must rely on institutional controls (a land-use restriction and/or a notice on the property deed) that bar water supply well installation and groundwater use of any kind.]]

Evaluation of dermal contact with groundwater may be needed to quantify risks associated with gardening, utility maintenance or digging at sites with shallow groundwater tables. Since this pathway is not commonly evaluated, contact your program representative so they can get assistance from a NCDEQ toxicologist if groundwater exposure through digging beyond the water table is a concern.

###### Surface Water

[[IMAGE_15_5|Sidebar: Surface water quality must meet the 15A NCAC 02B standards to be eligible for No-Further-Action status.]]

The surface water pathway evaluates the risk to a recreator or trespasser who comes into direct contact with contaminated surface water. To predict whether surface waters will become contaminated due to contaminant migration, use the contaminant migration worksheets at the bottom of the Main Menu as discussed below. Risk-based site closure is not possible if contamination from the site discharges into surface waters at levels that violate applicable surface water quality standards.

###### Vapor Intrusion

The vapor intrusion pathway should be considered complete for residential and non-residential receptors in structures overlying or within 100 feet (vertical or horizontal) of contaminated soil or groundwater. Consult the DWM Vapor Intrusion Guidance document for specifics.

##### Contaminant Migration Pathways

The calculator can evaluate three environmental pathways as shown in the graphic below:

1. Soil contaminants that vertically leach to groundwater and migrate to a downgradient point. This downgradient point may be a water supply well, property boundary, sensitive environment, or other point of interest. This distance can be set to zero to evaluate vertical leaching only.
2. Groundwater contaminant migration to a specified downgradient point.
3. Soil contaminants that vertically leach to groundwater and migrate downgradient to a surface water body and are diluted by a known surface water discharge rate.

[[IMAGE_16_0|Diagram showing soil leaching to groundwater and groundwater migration to POE]]

#### 3.3.2 Exposure Factors and Target Risks

[[IMAGE_16_1|Screenshot of Exposure Factors and Target Risks buttons]]

The complete list of exposure factors (values related to human behavior and characteristics that help determine exposure, e.g., the amount of soil or water ingested in a day) used in the Risk Calculator can be found in Appendix D of Risk Evaluation Equations and Calculations.

NCDEQ default values are populated on the Exposure Factors and Target Risks sheet shown below. Justifications for changing the default value must be documented in the “Justification” column and require NCDEQ approval.

[[IMAGE_17_0|Screenshot of Exposure Parameters data entry table]]

- The target cancer risk and hazard index values are established in law.
- Red indicates a default value has been changed. Space is provided to justify the change.

[[IMAGE_17_1|Screenshot of User Defined Child and Adult exposure parameters]]

- Children are not considered trespassers, so cells are flagged as NA to prevent data entry for this scenario.
- Cells shaded grey when the exposure pathway is incomplete.

If the “Recreator/Trespasser” pathway was selected as complete, the user must enter the appropriate exposure parameters in the “Site Specific Value” column for the User-Defined Adult. These receptors can only be run one at a time.

#### 3.3.3 Contaminant Migration Parameters

[[IMAGE_18_0|Screenshot of Contaminant Migration Parameters buttons]]

Contaminant migration parameters are primarily related to geology/hydrogeology (porosity, moisture content, hydraulic conductivity, hydraulic gradient, aquifer thickness, dry bulk density, and fraction organic carbon) and plume dimensions (thickness, length, and width of soil and groundwater source areas). Where a NCDEQ default value is not provided, a site-specific value is required. A site-specific value entered in place of a default value will change the text color to red. Justification for the change should be documented in the “Justification” column. If needed parameters are not entered for a given pathway, the subsequent Output Forms will show “NM” (Not Modeled). See the Risk Evaluation Equations and Calculations document for documentation of the variables used.

[[IMAGE_18_1|Screenshot of Contaminant Migration Parameters data entry table]]

- If one or more “Contaminant Migration Pathways” are checked as complete, the parameters needed will be highlighted in yellow, otherwise the cells will be gray. If a needed parameter is not entered, the output will be “NC” for not calculated.

Water filled soil porosity, air filled soil porosity, and fraction organic carbon have two default values, one for the soil to outdoor air pathway and one for the soil to groundwater pathway. If a site-specific value is entered, the user should enter the same value for both pathways. The default values given are considered conservative for the given pathway.

To evaluate the groundwater to surface water pathway, the user must enter a site-specific groundwater to surface water seepage area (width and thickness) and a published surface water discharge rate. If no surface water flow data are available from published reports or acquired measurements, the user must use the default value of zero. The Risk Calculator will calculate a surface water concentration, compare it with the standard, and determine whether the standard has been exceeded.

#### 3.3.4 Sample Statistics

[[IMAGE_19_0|Screenshot of Exposure Point Concentrations buttons]]

The optional “Sample Statistics” sheet is included to allow for basic statistical calculations of analytical data. This sheet is not linked to any other input or output sheets, and the data on this sheet is not carried forward in the risk assessment calculator.

#### 3.3.5 Data Input - Exposure Point Concentrations

For a given medium, risk will be calculated using one representative set of analytical results. The Risk Calculator does not accommodate multiple sample results or the spatial distribution of contamination in the evaluation of a selected pathway. Therefore, it is important that the data entered be the highest concentration of each detected chemical in the exposure unit and medium being evaluated. Both the chemical name and the CAS number can be searched in Excel. While in the soil, groundwater, or surface water Exposure Point Concentration sheets, selecting the “Next” button will take the user to an override sheet. The override sheets allow NCDEQ toxicologists to modify the data entry according to the routes of exposure. They are not editable by the user and a pop-up message will reflect that. Contact your remediation program representative if you would like a NCDEQ toxicologist to assist you with site-specific exposure pathways.

[[IMAGE_20_0|Screenshot of Exposure Point Concentrations data entry table]]

- These optional columns are not used in the risk assessment calculations.
- “See Selected Chemicals” reduces the list of chemicals to only those where a concentration has been entered.

Enter the maximum concentration of each detected contaminant as the “Exposure Point Concentration” for each affected media where a risk determination is desired, including:

1. Contaminants detected at concentrations less than their residential Preliminary Soil Remediation Goal (PSRG), 15A NCAC 02L standard, or 15A NCAC 02B standard,
2. Contaminant results flagged by the analytical lab, and
3. Contaminants where the laboratory reporting limits were greater than the PSRGs, 15A NCAC 02L standards, or 15A NCAC 02B standards. Concentrations entered should be the lab’s reporting limit.

**Example data input scenarios:**

| Maximum Detection | Laboratory Practical Quantitation Limit (PQL) | Screening Level (e.g., PSRG) | Value to Enter in Calculator |
|---|---|---|---|
| ND | 0.8 | 1 | Enter no value |
| 0.8 | 0.5 | 1 | 0.8 |
| 0.8J | 0.5 | 1 | 0.8 |
| ND | 1.5 | 1 | 1.5 |

The “Justification” column can state the source of the data, e.g., boring or monitoring well ID. These maximum concentrations are intended to be conservative and can represent either sitewide conditions or a defined exposure unit. If cumulative risks are acceptable (less than 1.0 x 10⁻⁴ for carcinogens and a hazard index of less than 1.0 for noncarcinogens) using sitewide maximum concentrations, then no further evaluation of multiple exposure units is necessary. Otherwise, the risk should be calculated for each exposure unit. If cumulative risks exceed the thresholds using maximum concentrations, or if a contaminant is not listed in the Risk Calculator, contact your DEQ program representative for further guidance.

### 3.4 Data Output Sheets

Each button in the “Data Output Sheet” in Sections *2 Direct Contact Soil and Water Calculators* and *3 Vapor Intrusion Calculators* is a unique risk calculation for that pathway. The calculator also presents a summary output of all pathways for a quick understanding of which pathways present an unacceptable risk in Section *1 Summary Output for All Calculators*.

#### 3.4.1 Summary Output for All Calculators

[[IMAGE_21_0|Screenshot of Summary Output for All Calculators buttons]]

The “Risk for Individual Pathways” presents the calculated risks for all the pathways identified as complete and shows which pathways exceed acceptable risk levels. A “NC” result indicates that the pathway was Not Complete because it was not checked.

[[IMAGE_21_1|Screenshot of Risk for Individual Pathways summary table]]

- NC=not complete. The user did not check this pathway as complete
- Calculated risk
- YES means Carcinogenic Risk > 1.0x10⁻⁴ or HI > 1.0

#### 3.4.2 Direct Contact Soil and Water Calculators

[[IMAGE_22_0|Screenshot of Direct Contact Soil and Water Calculators buttons]]

This section provides details on the risk posed by each chemical in the complete exposure pathways. An example output sheet is shown for soil below.

[[IMAGE_22_1|Screenshot of Direct Contact Soil calculation output table]]

- Concentrations carried over from input sheet. Will be the same for each route of exposure unless approved by a NCDEQ toxicologist.
- Shaded cells are the calculated risk for individual chemicals. Bold values indicate a carcinogenic risk above 1.0x10⁻⁶ or a hazard quotient greater than 0.2.
- Cumulative risk will be bold if the carcinogenic risk exceeds 1.0x10⁻⁴ or a hazard index greater than 1.0.

The calculated risks for each route of entry are shown in the gray cells and summed in the white cell to the right. Target risks for individual chemicals are 1.0x10⁻⁶ for carcinogens and a 0.2 for noncarcinogens. The individual risks are summed to determine the cumulative risks for each receptor. Cumulative risks for each receptor are then compared to a risk of 1.0x10⁻⁴ for carcinogens and 1.0 for noncarcinogens.

#### 3.4.3 Vapor Intrusion Calculators

The Risk Calculator includes links to the DWM vapor intrusion screening levels. Users that have screening level exceedances are directed to enter the data into the calculator to calculate risk. **It is DWM policy that vapor mitigation decisions be based on risk and not on a screening level exceedance**. Therefore, it is important that users follow the North Carolina Division of Waste Management Vapor Intrusion Guidance document.

[[IMAGE_23_3|Diagram of vapor intrusion into buildings with basements, crawl-spaces, and slabs]]

[[IMAGE_23_0|Screenshot of Vapor Intrusion Calculators buttons]]

[[IMAGE_23_2|Sidebar: The Risk Calculator does not include a calculation for soil to indoor air due to challenges associated with modeling vapor intrusion for soil sources. If impacted soil is present beneath or adjacent to a building, sub-slab gas, crawl space, and/or indoor air samples should be collected.]]

The “Vapor Intrusion Calculators” evaluate risk associated with indoor inhalation of contaminated vapor intruding into a structure from subsurface contamination. Vapor intrusion risk can be calculated for a resident or a non-residential worker using either indoor air data, soil gas data, or groundwater data, depending on the site-specific data availability. All vapor intrusion calculations and inputs used in the calculator can be found in the Risk Evaluation Equations and Calculations document. An overview of the risk characterization approach used in each calculator is summarized as follows:

- Site-specific indoor air concentrations are compared to the USEPA screening levels to calculate the risk for each individual contaminant, then the risks for individual contaminants are summed to calculate the cumulative risk.
- For the soil gas to indoor air calculator, soil gas concentrations are multiplied by an attenuation factor of 0.01 for the non-residential calculator and 0.03 for the residential calculator to predict indoor air concentrations. Cumulative risks are then calculated for the predicted indoor air concentrations using the same process as the indoor air calculator.
- For the groundwater to indoor air calculator, groundwater concentrations are multiplied by Henry’s Law Constant to predict soil gas concentrations, then multiplied by an attenuation factor of 0.001 (same for residential and non-residential), and then multiplied by a 1,000 L/m³ conversion factor to predict indoor air concentrations. Cumulative risks are then calculated for the predicted indoor air concentrations using the same process as the indoor air calculator.

An example vapor intrusion output sheet is shown below.

[[IMAGE_24_0|Screenshot of Vapor Intrusion output table]]

- Orange cells indicate the chemical is non-volatile.

The NCDEQ Risk Calculator does not allow modification of the residential VI exposure duration for mutagens and conservatively applies a default of 26-years regardless of the site-specific exposure duration entered in the calculator. Consult with a NCDEQ toxicologist if you need to adjust exposure parameters at a site for one of the following mutagenic contaminants.

**List of Mutagenic Contaminants**

| Chemical | CASRN | Reference |
|---|---|---|
| Acrylamide | 79-06-1 | IRIS |
| Benz[a]anthracene | 56-55-3 | Benzo[a]pyrene* |
| Benzidine | 92-87-5 | Supplemental Guidance |
| Benzo[a]pyrene | 50-32-8 | Supplemental Guidance |
| Benzo[b]fluoranthene | 205-99-2 | Benzo[a]pyrene* |
| Benzo[k]fluoranthene | 207-08-9 | Benzo[a]pyrene* |
| Chromium(VI) | 18540-29-9 | CalEPA and IRIS |
| Chrysene | 218-01-9 | Benzo[a]pyrene* |
| Coke Oven Emissions | 8007-45-2 | 70 Federal Register 19992 |
| Dibenz[a,h]anthracene | 53-70-3 | Supplemental Guidance |
| Dibromo-3-chloropropane, 1,2- | 96-12-8 | PPRTV |
| Dimethylbenz(a)anthracene, 7,12- | 57-97-6 | Supplemental Guidance |
| Ethylene Oxide | 75-21-8 | IRIS |
| Indeno[1,2,3-cd]pyrene | 193-39-5 | Benzo[a]pyrene* |
| Methylcholanthrene, 3- | 56-49-5 | Supplemental Guidance |
| Methylene Chloride | 75-09-2 | IRIS |
| Methylene-bis(2-chloroaniline), 4,4'- | 101-14-4 | PPRTV |
| Nitrosodiethylamine, N- | 55-18-5 | Supplemental Guidance |
| Nitrosodimethylamine, N- | 62-75-9 | Supplemental Guidance |
| Nitroso-N-ethylurea, N- | 759-73-9 | Supplemental Guidance |
| Nitroso-N-methylurea, N- | 684-93-5 | Supplemental Guidance |
| Safrole | 94-59-7 | Supplemental Guidance |
| Trichloroethylene | 79-01-6 | IRIS |
| Trichloropropane, 1,2,3- | 96-18-4 | IRIS |
| Urethane | 51-79-6 | Supplemental Guidance |
| Vinyl Chloride | 75-01-4 | Supplemental Guidance |

#### 3.4.4 Sitewide Risk Summary

[[IMAGE_25_0|Screenshot of Sitewide Risk Summary output table]]

The calculator computes the total risks of all contaminants for each pathway in each medium individually. To ensure that all site risks are within the allowable limits, a Sitewide Risk Summary Sheet has been developed within the calculator to sum the risks of all pathways. The user selects the pathways that are complete.

- The calculator only allows one set of vapor data to be checked so the vapor risk is not double counted.
- The user selects the pathways that will remain complete following the use of engineered or institutional controls, i.e. those to be summed.

The vapor intrusion risk can be calculated by using either groundwater, soil gas, or indoor air data. **The calculator’s sitewide risk summary sheet is designed to consider only one vapor risk calculation, so the inhalation risk will not be overestimated.**

When risk from any contaminated media is exceeded, it is up to the risk manager on how to best mitigate those risks through remediation, engineered controls and/or institutional controls.

### 3.5 Contaminant Migration Worksheets

[[IMAGE_26_0|Screenshot of Contaminant Migration Worksheets buttons]]

The contaminant migration equations predict contaminant concentrations at a specified distance from a known source. Three transport equations are included in the Risk Calculator: (i) soil leaching to groundwater, (ii) groundwater migration to a potential exposure point, and (iii) surface water dilution. These equations can be viewed in the Risk Evaluation Equations and Calculations document on the Risk Evaluation Resources page of the Risk Based Remediation website here: Risk Evaluation Resources | NC DEQ

#### 3.5.1 Soil Leaching to Groundwater Calculations

The soil leaching to groundwater calculations are based on methodology presented in the USEPA Soil Screening Guidance (USEPA, 1996) and USEPA Supplemental Guidance for Developing Soil Screening Levels for Superfund Sites (USEPA, 2002). These equations are also used to develop the Protection of Groundwater PSRGs. The equations predict a groundwater concentration based on source area soil concentration. If “0 feet” is entered for the distance to the POE on the “Contaminant Migration Parameters” sheet, the calculator will only consider vertical leaching to groundwater to predict the groundwater concentration directly beneath the soil source area. A distance greater than zero will also include the lateral transport equation described in the next section.

[[IMAGE_26_2|Sidebar: When only the default parameters are used, the result will be close to the Protection of Groundwater PSRG.]]

The assumptions used in the leaching equation are listed and depicted in the USEPA graphic below:
- Infinite source (i.e., steady-state concentrations are maintained over the exposure period).
- Uniformly distributed contamination from the surface to the top of the aquifer.
- No contaminant attenuation (i.e., adsorption, biodegradation, chemical degradation) in soil.
- Instantaneous and linear equilibrium oil/water partitioning.
- Unconfined, unconsolidated aquifer with homogeneous and isotropic hydrologic Properties.
- Receptor well at the downgradient edge of the source and screened within the plume.
- No contaminant attenuation in the aquifer.
- No NAPLs present (if NAPLs are present, the SSLs do not apply).

[[IMAGE_27_0|Diagram showing soil source area and groundwater contaminant plume]]

Two equations are available for soil leaching to groundwater, (i) unlimited source model for chronic exposure and (ii) mass limit model for chronic exposure. Per the USEPA Soil Screening Guidance, the unlimited source model assumes an infinite source, so it may violate mass-balance considerations, especially for small sources. As a result, the USEPA guidance also specifies a mass limit equation that may be used when the depth of the contaminated soil source is known or can be estimated with confidence. Also, per the USEPA Soil Screening Guidance, screening levels are calculated using both the unlimited source equation and the mass limit equation. The higher screening level is then used for subsequent modeling calculations.

To determine default infiltration rates, an evaluation was performed by the NCDEQ Dry Cleaning Program at 20 sites that were selected to be representative of different geological and weather conditions across NC. For each site, the USEPA’s Hydrologic Evaluation of Landfill Performance (HELP) Model Version 3.07 was used to calculate infiltration rates as a percentage of precipitation. Based on review of the spatial distribution of the calculated infiltration rates, default infiltration rates were selected for different geographic zones across the State of North Carolina. A description of each zone and recommended default infiltration rates to be applied to each zone are summarized below:

- Mountain Zone (includes Blue Ridge and Western Piedmont belts) – 30% of precipitation
- Piedmont Zone (includes Eastern and Central Piedmont belts) – 25% of precipitation
- Coastal Plain Zone (includes Inner and Outer Coastal Plain belts) – 45% of precipitation

[[IMAGE_28_0|Map of North Carolina showing Mountain, Piedmont, and Coastal Plain zones]]

The user should determine average precipitation in the site area using published references, then multiply the precipitation value by the infiltration percentage applicable to the site’s geographic zone to calculate the infiltration rate to be input.

Infiltration rates should represent source areas with no surface cover to confirm whether an engineered surface cover is warranted to prevent future leaching of soil contaminants.

#### 3.5.2 Groundwater Migration Calculations

Groundwater migration is calculated using the Domenico model [Domenico and Robbins (1985) and Domenico (1987)]. This one-dimensional model is recognized by USEPA and is the recommended modeling equation in the ASTM Standard Guide for Risk-Based Corrective Action at Petroleum Release Sites (ASTM, 2002). This methodology is used to predict the steady-state groundwater concentration at a specified downgradient distance from a source area accounting for advection and dispersion. Dispersivity values are calculated based on the user-specified migration distance using equations specified in the ASTM guidance (ASTM, 2002). The Risk Calculator conservatively assumes no chemical degradation.

Source soil or groundwater contaminant concentrations are used to estimate the concentrations of each contaminant in groundwater at the specified distance. The calculated groundwater concentrations are compared with the 15A NCAC 02L standards to determine if the standards are exceeded. Because this is a simple, 1-D model, it should only be used as a screening tool.

[[IMAGE_29_2|Sidebar: Due to the simplicity of the transport equations, empirical monitoring data that confirm the plume is stable, predictable and unlikely to impact a nearby receptor are more reliable to support risk management decisions.]]

#### 3.5.3 Surface Water Dilution Calculations

To predict the contaminant concentrations in a surface water receptor, the calculator first employs the leaching and/or lateral transport equations to predict the groundwater concentrations at the surface water location. The user-specified plume thickness and width are used to calculate the volume of groundwater entering the surface water body to calculate the surface water dilution factor. The surface water dilution factor is applied only if the surface water flow rate is known or measured, otherwise, no surface water dilution is assumed.

[[IMAGE_29_0|Screenshot of Contaminant Migration to Surface Water Receptor table]]

- Carried over from the “Contaminant Migration Parameters” sheet.
- Enter the appropriate 15A NCAC 02B Standard. Contact a remediation program representative if a standard is not available.

This surface water dilution equation is based on standard groundwater and surface water mixing calculations. If the results of the initial modeling indicate concentrations at the surface water body above 15A NCAC 02B standards, site-specific values for flow should be estimated based on published references available from the United States Geological Survey. Surface water flow rates should be equivalent to the 7Q10, which is the lowest flow that occurs on average once every 20 years. The calculated surface water concentrations are then compared to the 15A NCAC 02B standards to determine if the standards are exceeded. The user is responsible for determining the classification of the surface water body and entering the appropriate 15A NCAC 02B standards into the calculator.

#### 3.5.4 Model Verification for Transport Pathways

Predicting the plume’s extent is important for protecting future receptors and implementing land-use restrictions. The default parameters in the transport equations are conservative, and it is common to find that the plume extent is not as far as the model projects. The results of the contaminant transport pathways should always be compared with site-specific empirical sampling data to confirm the validity of the modeling results. Determination of plume stability is based on concentration versus time graphs for selected monitoring wells, concentration versus distance graphs along the plume centerline and professional judgement.

Other software packages, e.g., the Mann-Kendall toolkit, can be used to characterize groundwater concentration trends in individual monitoring wells. Indications of biodegradation based on daughter product formation and/or geochemical parameter data may also provide lines of evidence of plume stability.

### 3.6 Unprotect All Sheet and Protect All Sheets

The Unprotect/Protect All Sheets buttons at the bottom of the Main Menu page are for NCDEQ use only. The Risk Calculator is password-protected so that the equations and required default exposure parameters can only be changed by a NCDEQ toxicologist.

## 4.0 CALCULATING CLEANUP LEVELS

The Risk Calculator incorporates both “Forward Mode” and “Backward Mode” for the contaminant migration calculations. The “Forward Mode” calculators predict contaminant concentrations at a downgradient location. For the “Backward Mode” calculators, the user enters the target concentrations (e.g., 15A NCAC 02L, 15A NCAC 02B standards) at a point of exposure and the calculator predicts the source area concentrations that would meet the designated target concentrations. The “2L Standard” column on the “Soil Source to Groundwater Receptor” and “Groundwater Source to Groundwater Receptor” sheets show the 15A NCAC 02L standards for reference. However, the user may manually enter a target concentration in the “Target Groundwater Concentration at the Receptor” column. This is designed to account for scenarios where the user may want to enter a target groundwater concentration other than 15A NCAC 02L standards, such as screening levels protective of vapor intrusion. On the Soil Source to Surface Water Receptor” and “Groundwater Source to Surface Water Receptor” sheets, the user must also manually enter 15A NCAC 02B standards or other target screening levels.

[[IMAGE_30_0|Screenshot of Backward Mode Contaminant Migration output table]]

The backward calculators may also be used to calculate source area remedial goals for target concentrations at a downgradient location for other cumulative risk pathways. For example, if remedial goals are needed to address vapor intrusion on an off-source property, the distance to the property boundary will be entered, and the target concentrations protective of vapor intrusion could be entered as the target concentration at that boundary. The calculator would then provide a cleanup goal for source soil or groundwater. The Risk Calculator allows manual entry of any concentration as the desired target to provide flexibility.

### 4.1 Remedial Goals for Direct Contact Pathways

The direct contact pathways include three different individual exposure pathways and commonly incorporates risks for multiple contaminants. Unless there is one contaminant clearly driving the risk at a site, combinations of different cleanup goals would be needed. Due to this complexity, development of a simple backward mode calculator is not feasible. An acceptable approach to determining remedial goals for soil, for example, is to simply enter various combinations of concentrations into the calculator until the desired risk output is achieved. The concentrations that result in acceptable risk levels may then be used as remedial goals. Alternately, the user may calculate a risk at each sample location and remediate only the area with unacceptable risk.

### 4.2 Remedial Goals for Indoor Inhalation Pathways

Development of remedial goals for the indoor inhalation pathway is likely the most complex, particularly when the source of vapors is impacted soil in the vadose zone. Modeling of soil emissions to indoor air presents challenges and is the subject of current research in the field of vapor intrusion. If soil remediation is required to address the vapor intrusion pathway, the remediation should focus on source removal followed by soil gas monitoring to evaluate remediation progress. The soil gas monitoring results can be evaluated with the calculator to determine if the target risks have been met. Because of the heterogeneity of soil gas, many soil remedies to address vapor intrusion will also incorporate measures to ensure that the vapor intrusion pathway is incomplete by installing subsurface vapor extraction piping in the backfill in case vapor removal becomes necessary in the future.

If the primary source of vapors is from impacted groundwater, the groundwater to indoor air calculator may be used. The user may enter various combinations of concentrations into the calculator until the desired risk output is achieved. The concentrations that result in acceptable risk levels may then be used as remedial goals. The backward mode calculators may also be used to evaluate source area groundwater concentrations that are protective of vapor intrusion at a specified distance from the source area.

## 5.0 REPORTING

If the Risk Calculator is used to make decisions as part of a site assessment or a remediation plan, the pertinent Risk Calculator forms containing data must be included in the report. Refer to the Technical Guidance for Risk-Based Environmental Remediation of Sites for procedures on developing a risk-based remedial action plan.

If a risk evaluation requires discussion with a NCDEQ program representative or toxicologist, the following information is recommended to facilitate discussion:

- Figures that clearly show sample locations. The figures should also include the following information:
  - Property boundaries, buildings, covered areas, and open spaces,
  - Extent of soil and groundwater contamination, groundwater potentiometric surface/groundwater flow, exposure unit boundaries, and distance to receptors,
  - Graphs of groundwater contaminant concentrations over time.
- Tables summarizing the following:
  - The contaminants detected, and justification for any that are demonstrated to not be associated with the site’s release,
  - The basis for the input concentrations for each exposure unit and exposure pathway,
  - Any calculations performed.
- Analytical data for each medium evaluated.

## 6.0 REFERENCES

ASTM. Standard Guide for Risk-Based Corrective Action. E2081-11. 2000.

Domenico, P.A. and Robbins, G.A. A New Method of Contaminant Plume Analysis. Groundwater 23: 476-485. 1985.

NCDWM. Vapor Intrusion Guidance. March 2018.

USEPA. Soil Screening Guidance: User’s Guide. July 1996.

USEPA. Supplemental Guidance for Developing Soil Screening Levels for Superfund Sites. December 2002.
