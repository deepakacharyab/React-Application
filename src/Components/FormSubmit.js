import React, { useState } from 'react';
import {useLocalStorage, writeStorage } from '@rehooks/local-storage';
import {handleForm} from '../Api_folder/Api'
import {boundries, userStore, organizationUnits, datasetList, capitalizeFirstLetter, aggregationList} from '../Constants/const'

var Form = function() {
  const [dataset, setDataset] = useState("");
  const [org_unit, setOrgUnit] = useState("");
  const [agg_period, setAggPeriod] = useState("");
  const [start_date, setStartDate] = useState("");
  const [end_date, setEndDate] = useState("");
  const [message, setMessage] = useState("");
  const [myArray, setMyArray] = useState([]);
  const [getIds, setIds] = useLocalStorage('ids');
  const [getItem, setItem] = useLocalStorage('elem');
  const [showSpinner, setShowSpinner] = useLocalStorage('spin')

  
  let product, var_name, x_start_stride_stop, y_start_stride_stop;   
    
  // Handling create record button code
  let handleSubmit = async (e) => {
    setShowSpinner(0);
    e.preventDefault();

    if(dataset === "precipitation"){
      product = 'GPM_3IMERGDF_06';
      var_name = 'precipitationCal';
      x_start_stride_stop = '';
      y_start_stride_stop = '';
    }else if(dataset === "vegetation"){
      product = 'MOD13A2';
      var_name = '_1_km_16_days_NDVI';
      x_start_stride_stop = '[0:5:1199]';
      y_start_stride_stop = '[0:5:1199]';
    }else{
      product = 'MOD11B2';
      var_name = 'LST_Day_6km';
      x_start_stride_stop = '';
      y_start_stride_stop = '';
    }
      
    var org_var_set = JSON.parse(org_unit).name + " - "+JSON.parse(org_unit).level;

    var final_params = {
      "dataset": dataset, 
      "org_unit": JSON.parse(org_unit).name, 
      "agg_period": agg_period,
      "start_date": start_date,
      "end_date": end_date,
      "data_element_id": userStore[dataset], 
      "stat_type": "mean",
      "product": product,
      "var_name": var_name,
      "x_start_stride_stop": x_start_stride_stop,
      "y_start_stride_stop": y_start_stride_stop,
      "dhis_dist_version": userStore['dhis_dist_version'],
       "boundaries": boundries
    };
    
    // Displaying the value of Organization level on the console
    console.log('Selected Organization Unit Level = ', JSON.parse(org_unit).level);
    
    await handleForm(JSON.stringify(final_params)).then((res) => {setMessage(res);myArray.push(res);}).catch((err) => {console.error(err);})

    if(JSON.parse(localStorage.getItem("ids")) != null && JSON.parse(localStorage.getItem("ids").length > 0)) myArray.push(...JSON.parse(localStorage.getItem("ids"))) 
    myArray.push(message);
    setIds(JSON.stringify( [...new Set(myArray.filter((x ="") => x.trim()))]))
    setItem(1);  
  };
  
  writeStorage('statusTab', 1);

  // Rendering the react component
  return (
    <div className="form-style-5">
      <div className='mandatory'>* All Fields Mandatory</div>
      <form onSubmit={handleSubmit}>
      <div> DATASET
        <select id="lang" onChange={(e) => setDataset(e.target.value)} required>
        <option value="">Select</option>
        {datasetList.map(function (e, key) {
          return <option key={key} value={e}>{capitalizeFirstLetter(e)}</option>;
        })};
        </select>
      </div>

      <div> ORGANIZATION UNIT
        <select id="lang" onChange={(e) => setOrgUnit(e.target.value)} required>
        <option value="">Select</option>
        {organizationUnits.map((e, key) => {
        return <option key={key} value={JSON.stringify(e)}>{e.name+" - "+ e.level}</option>;
        })}
        </select>
      </div>

      <div> AGGREGATION PERIOD
        <select id="lang" onChange={(e) => setAggPeriod(e.target.value)} required>
          <option value="">Select</option>
          {aggregationList.map(function (e, key) {
          return <option key={key} value={e}>{e}</option>;
        })};
        </select>
      </div>
        
      <div> START DATE
        <input
          type="date"
          value={start_date}
          placeholder="Start Date"
          onChange={(e) => setStartDate(e.target.value) }
          required/>
      </div>

      <div> END DATE
        <input 
          type="date"
          value={end_date}
          placeholder="End Date"
          onChange={(e) => setEndDate(e.target.value)}
          required/>
      </div>
        <div className="message">{message ? <span className="formMessage">New Request Created Successfully with Reference Id: {message}</span> : null}</div>
        <button type="submit" className="createBtn">CREATE REQUEST</button>
      </form>
    </div>
  );
}
export {Form};
