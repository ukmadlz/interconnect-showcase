$(document).ready(function () {
  // Start PouchDB
  var db = PouchDB('interconnect');

  // Sync to remote Cloudant
  var remoteUrl = 'https://stravedinhesummovelledis:f614d25cf8ff26cbbd9a36bb02ee5739477f6dd1@b710603f-85d8-4d24-8e8c-7cb34a3aa9ce-bluemix.cloudant.com/interconnect-showcase';
  db.sync(remoteUrl, {
    live: true,
    retry: true,
  });

  // On load, load existing material
  db.allDocs({
    include_docs: true,
    attachments: true,
  }).then(function (result) {
    // handle result
    $.each(result.rows, function (index, doc) {
      templateShowcase(doc.doc);
    });
  }).catch(function (err) {
    console.log(err);
  });

  // Allow for changes on the fly
  var changes = db.changes({
    retry: true,
    live: true,
    include_docs: true,
    attachments: true,
  }).on('change', function (change) {
    templateShowcase(change.doc);
  }).on('error', function (err) {
    console.log('Changes', err);
  });

  var templateShowcase = function (doc) {
    var backgroundImage = '';
    $.each(doc._attachments, function (index, image) {
      console.log(index, image);
      backgroundImage = `
      background:url(data:${image.content_type};base64,${image.data}) no-repeat center center fixed;
      background-size:cover;
      `;
    });

    var template = `<div id=\"${doc._id}\" class=\"column\" style=\"${backgroundImage}\">
      <h2>${doc.title}</h2>
      <div class=\"description\" >
        <p>${doc.description}</p>
        <a target=\"_blank\" href=\"${doc.url}\" >
          ${doc.url}
        </a>
      </div>
    </div>`;
    if ($('#' + doc._id).length) {
      $('#' + doc._id).replaceWith(template);
    } else {
      $('#showcase-list').append(template);
    }
    $('.column').on('click', function (e) {
      e.preventDefault();
      if($(this).hasClass('full-width')) {
        $(this).removeClass('full-width')
      } else {
        var recordId = $(this).attr('id');
        db.get(recordId, {
          include_docs: true,
        }).then(function (data) {
          $('#' + recordId).addClass('full-width');
          console.log(data);
        }).catch(function (err) {
          console.log(err);
        });
      }
    });
  };
});
