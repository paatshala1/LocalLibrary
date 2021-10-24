
document.addEventListener('DOMContentLoaded', ()=>{
  const $bookList = document.getElementById('bookList'),
        $allBooks = document.getElementsByClassName('eachBook'),
        $delButton = document.getElementById('delButton');

  $delButton.style.visibility = 'hidden';
  
  let selectedBooks = 0;
  let totalBooks = $allBooks.length;
  
  if ($bookList){
    $bookList.addEventListener('click', async ()=>{

      selectedBooks = 0;
      for await (b of $allBooks){
        if (b.checked == true){
          selectedBooks++;
        }
      }
      
      if (selectedBooks == totalBooks){
        // console.log(`Books selected: ${selectedBooks}`);
        // console.log(`Total books: ${totalBooks}`);
        $delButton.style.visibility = 'visible';
      }
      else {
        $delButton.style.visibility = 'hidden';
      }
    })
  }
  else {
    $delButton.style.visibility = 'visible';
  }

});

// exports.selectedBooks = selectedBooks;
