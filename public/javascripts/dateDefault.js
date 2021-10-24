document.addEventListener('DOMContentLoaded', function() {
    const now = new Date();
    let minDate = new Date(now);
    minDate.setDate(now.getDate() + 1);
    
    // if (document.getElementById('dateControl')){
    //     let cDate = new Date(document.getElementById('dateControl').textContent);
    //     minDate.setDate(cDate.getFullYear(),cDate.getMonth(),cDate.getDate());
    //     console.log(minDate);
    // }
    
    let elem = document.querySelectorAll('.datepicker');
    let instance = M.Datepicker.init(elem, {
      defaultDate: minDate,
      setDefaultDate: true,
      autoClose: true,
      minDate: minDate,
      // showClearBtn: true,
      format: 'yyyy-mm-dd'
    });

  });
