var sendflag = false;
var formSubmitButton = $("#form-submit-button button");
var isValidFilesSize = true;

$(document).ready(function() {
  $('#form-project').on('submit', function (e) {
    if (!e.isDefaultPrevented()) {
      var url = "app/backend-logic.php";
      var formData = new FormData(this);

      if (!validateForm(formData)) {
        return false;
      }

      // replace files from FileList to load files from separate array (FileList items cannot be removed individually):
      filesInput.val('');
      $.each(uploadedFilesArray, function (index, value) {
        formData.append('file_' + index, value);
      });

      $(this).closest('div').find('.loading-icon').show();
      $('#form-project > *').hide();
      if (window.matchMedia("(max-width: 768px)").matches) {
        $('#form-project').css({"height": "300px"});
      }

      if (!sendflag) {
        sendflag = true;
        $.ajax({
          type: "POST",
          url: url,
          data: formData,
          dataType: "json",
          success: function success(data) {
            sendflag = false;
            $('.loading-icon').hide();

            if (data.sent === "true") {
              $('#form-success-message').fadeIn();
            } else {
              $('#form-project > *').show();
            }
          },
          error: function (jqXHR, exception) {
            var msg = '';
            if (jqXHR.status === 0) {
              msg = 'Not connect.\n Verify Network.';
            } else if (jqXHR.status == 404) {
              msg = 'Requested page not found. [404]';
            } else if (jqXHR.status == 500) {
              msg = 'Internal Server Error [500].';
            } else if (exception === 'parsererror') {
              msg = 'Requested JSON parse failed.';
            } else if (exception === 'timeout') {
              msg = 'Time out error.';
            } else if (exception === 'abort') {
              msg = 'Ajax request aborted.';
            } else {
              msg = 'Uncaught Error.\n' + jqXHR.responseText;
            }
            console.log(msg);
          },
          cache: false,
          contentType: false,
          processData: false
        });
      }
      return false;
    }
  });

  var filesInput = $("#files");
  var filesList = $("#uploaded-files");
  var maxFilesSize = 5000000; // 5 MB
  var uploadedFilesArray = [];

  filesInput.on("change", function(event) {
    // reset files when Upload Files button is pressed:
    filesList.empty();
    var filesSize = 0;
    uploadedFilesArray = [];

    // add each file as a list item:
    $.each(this.files, function (index, value) {
      var li = $(
        "<li>" +
          "<p>" + value.name + "</p>" +
          "<progress class='progress-bar' value='0' max='100'></progress>" +
          "<a href='#' class='remove-file' data-uploaded-file-id='" + index + "'>x</a>" +
        "</li>"
      );
      filesList.append(li);

      // FileList is read-only, hence pushing files into a separate Array
      var uploadedFile = new FileReader();
			uploadedFile.readAsDataURL(value);
			uploadedFilesArray.push(uploadedFile);

      // imitate file upload before upload to server:
      var fileUploadingTime = value.size / 100000;
      var fileUpload = setInterval(function() {
        var pVal = $(".progress-bar").get(index).value;
        var pCnt = !isNaN(pVal) ? (pVal + 1) : 1;
        if (pCnt > 100) {
          clearInterval(fileUpload);
        } else {
          $(".progress-bar").get(index).value = pCnt;
        }
      }, fileUploadingTime);
      filesSize += value.size;
    });
    if (filesSize >= maxFilesSize) {
      isValidFilesSize = false;
    }
  });

  $('body').on('click', '.remove-file', function (e) {
      e.preventDefault();
      $(this).closest('li').remove();
      uploadedFilesArray.splice($(this).data("uploaded-file-id"), 1);
  });
});

function validateForm(formData) {
  var name = formData.get("name");
  var phoneNumber = formData.get("phone-number");
  var email = formData.get("email");
  var projectPostcode = formData.get("project-postcode");
  var customerType = formData.get("customer-type");
  var floorConstruction = formData.get("floor-construction");
  var typeOfBuild = formData.get("type-of-build");
  var projectInformation = formData.get("project-information");

  $('.validation-error').hide();

  var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  if (email === "") {
    $("#email").after('<span class="validation-error">please enter your email *</span>');
    return false;
  } else if (!emailReg.test(email)) {
    $("#email").after('<span class="validation-error">please enter valid email *</span>');
    return false;
  }

  var phoneNumberReg = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{2,6}$/;
  if (phoneNumber === "") {
    $("#phone-number").after('<span class="validation-error">please enter your phone number *</span>');
    return false;
  } else if (!phoneNumberReg.test(phoneNumber)) {
    $("#phone-number").after('<span class="validation-error">please enter valid phone number *</span>');
    return false;
  }

  if (!isValidFilesSize) {
    $("#files").after('<span class="validation-error">please enter files less than 5MB in total size *</span>');
    return false;
  }

  return true;
}

// MOBILE styling:
var smallScreen = window.matchMedia("(max-width: 480px)");
if (smallScreen.matches){
    $("#form-files label").html("Upload files <span>(max 5MB)</span>");
}