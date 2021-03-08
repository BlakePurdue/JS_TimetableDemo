// Firebase API key etc
var firebaseConfig = {
    apiKey: "AIzaSyD9OdchZSyegyUUCCRg-KhizhWdEHfsWco",
    authDomain: "js-timetabledemo.firebaseapp.com",
    projectId: "js-timetabledemo",
    storageBucket: "js-timetabledemo.appspot.com",
    messagingSenderId: "1082250790470",
    appId: "1:1082250790470:web:215feb1d81e2c667152c47"
};
// Initialize Firebase / Global db object
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

// Event class to better store class info
class Event {
    constructor(name, day, startDateHr, startDateMin, endDateHr, endDateMin, room, teacher, type) {
        this.name = name;
        this.day = day;
        this.startDateHr = startDateHr;
        this.startDateMin = startDateMin;
        this.endDateHr = endDateHr;
        this.endDateMin = endDateMin;
        this.room = room;
        this.teacher = teacher;
        this.type = type;
    }
}
// Global timetable object / Global renderer object 
var timetable = new Timetable();
var renderer = new Timetable.Renderer(timetable);


timetable.setScope(9, 3);
timetable.useTwelveHour();

// Add Days to side
timetable.addLocations([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday'
]);



// Function called on load of index.html to render timetable and run getData function
function makeTimetable() {
    renderer.draw('.timetable'); // any css selector


    // Call database and get classes
    getData();
}

//Function to get all class from db
function getData() {
    //console.log("getData ruinning");
    var eventList = new Map();
    db.collection("Classes")
        .onSnapshot((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                var newEvent = new Event(doc.data().name, doc.data().day, doc.data().startDateHr, doc.data().startDateMin, doc.data().endDateHr, doc.data().endDateMin, doc.data().location, doc.data().teacher, doc.data().type);
                //newEvent.startDateMin UNKOWN LINE


                var customOptions = {
                    data: { // each property will be added to the data-* attributes of the DOM node for this event
                        location: newEvent.room,
                        teacher: newEvent.teacher,
                        type: newEvent.type
                    },
                    onClick: function (event, timetable, clickEvent) {
                        console.log(event.options.data.location);
                        showModal(event);
                    } // custom click handler, which is passed the event object and full timetable as context  
                };


                timetable.addEvent(
                    newEvent.name,
                    newEvent.day,
                    new Date(2015, 7, 17, newEvent.startDateHr, newEvent.startDateMin),
                    new Date(2015, 7, 17, newEvent.endDateHr, newEvent.endDateMin),
                    customOptions
                );
                eventList.set(doc.id, newEvent);
                renderer.draw('.timetable'); // any css selector
            });
            addToDelSelect(eventList);
        });

}

function addToDelSelect(eventList) {
    // Delete all option already in select
    var select = document.getElementById("deleteDD");
    var length = select.options.length;
    //console.log(length);
    for (i = length - 1; i >= 0; i--) {
        select.options[i] = null;
    }
    //console.log(eventList.size);
    /*
    for (var i = 0; i < eventList.size; i++) {
        var sel = document.getElementById('deleteDD');
        var opt = document.createElement('option');
        var textLine = "Class: " + eventList[i].name + " Time: " + eventList[i].startDateHr + "-" + eventList[i].endDateHr + " " + eventList[i].day;
        opt.appendChild(document.createTextNode(textLine));
        opt.value = eventList[i].id;
        // add opt to end of select box (sel)
        sel.appendChild(opt);
    }   
*/
    var sel = document.getElementById('deleteDD');

    for (let [key, value] of eventList) {
        var opt = document.createElement('option');
        var textLine = "Class: " + value.name + " Time: " + value.startDateHr + "-" + value.endDateHr + " " + value.day;

        opt.appendChild(document.createTextNode(textLine));
        opt.value = key;
        sel.appendChild(opt);
    }
}

// Delete a class form
function deleteClass() {
    var r = confirm("Are you sure you want to delete this class?");
    if (r == true) {
        // Delete the selected class
        var selected = document.getElementById("deleteDD");
        var selectedOption = selected.value;
        $("#deleteDD").empty();

        db.collection("Classes").doc(selectedOption).delete().then(() => {
            console.log("Document successfully deleted!");
            location.reload();
        }).catch((error) => {
            console.error("Error removing document: ", error);
        });
    } else {
        // Do nothing dont delete class
    }
}

// Add a class form
function makeNewClass() {
    var name = document.getElementById("classInput").value;
    var day = document.getElementById("dayInput").value;
    var sHr = document.getElementById("startTimeHrInput").value;
    var sMin = document.getElementById("startTimeMinInput").value;

    var eMin = document.getElementById("endTimeMinInput").value;
    var eHr = document.getElementById("endTimeHrInput").value;

    var location = document.getElementById("locationInput").value;
    var teacher = document.getElementById("teacherInput").value;
    var type = document.getElementById("typeInput").value;

    // Add a new document with a generated id.
    db.collection("Classes").add({
            name: name,
            day: day,
            startDateHr: sHr,
            startDateMin: sMin,
            endDateHr: eHr,
            endDateMin: eMin,
            location: location,
            type: type,
            teacher: teacher
        })
        .then((docRef) => {
            console.log("Document written with ID: ", docRef.id);
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
            alert("Error adding document: ", error);
        });

    resetForm();
}
// Reset new class form 
function resetForm() {
    document.getElementById("newClassForm").reset();
}






var modalWrap = null;
/**
 * 
 * @param {string} title 
 * @param {string} description content of modal body 
 * @param {string} yesBtnLabel label of Yes button 
 * @param {string} noBtnLabel label of No button 
 * @param {function} callback callback function when click Yes button
 */
const showModal = (event) => {

    if (modalWrap !== null) {
        modalWrap.remove();
    }
    console.log(event);
    modalWrap = document.createElement('div');
    modalWrap.innerHTML = `
    <div class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-light">
            <h5 class="modal-title">
            ${event.name}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">

                <p><strong>Day: </strong>${event.location} </p>
                <p><strong>Start Time: </strong>${event.startDate}  </p>
                <p><strong>End Time: </strong>${event.endDate}  </p>
                <p><strong>Location: </strong>${event.options.data.location}  </p>
                <p><strong>Teacher: </strong>${event.options.data.teacher}  </p>
                <p><strong>Type: </strong>${event.options.data.type}  </p>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-primary modal-success-btn" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;

    //modalWrap.querySelector('.modal-success-btn').onclick = callback;

    document.body.append(modalWrap);

    var modal = new bootstrap.Modal(modalWrap.querySelector('.modal'));
    modal.show();
}
