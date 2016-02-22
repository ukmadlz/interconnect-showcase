$(document).ready(function () {
  // Start PouchDB
  var db = PouchDB('interconnect', {
    size: 40
  })
  // .then(function(){
  //    console.log('database created')
  // }).catch(function(err){
  //     console.log('Error created database',err)
  // });

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
    clickEvent();
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
    clickEvent();
  }).on('error', function (err) {
    console.log('Changes', err);
  });

  var templateShowcase = function (doc) {
    var backgroundImage = '';
    if (doc._attachments){
      $.each(doc._attachments, function (index, image) {
        backgroundImage = `
        background:url(data:${image.content_type};base64,${image.data}) no-repeat center center fixed;
        background-size:cover;
        `;
      });
    }

    var urls = '';
    if (typeof doc.url === 'string') {
      urls += `<p><a target=\"_blank\" href=\"${doc.url}\" >
        ${doc.url}
      </a></p>`;
    } else {
    $.each(doc.url, function (index, url) {
      urls += `<p><a target=\"_blank\" href=\"${url}\" >
        ${url}
      </a></p>`;
    });
    }

    var template = `<div id=\"${doc._id}\" class=\"column\" style=\"${backgroundImage}\">
      <h2>${doc.title}</h2>
      <div class=\"description\" >
        <p>${doc.description}</p>
        ${urls}
      </div>
    </div>`;

    if ($('#' + doc._id).length) {
      $('#' + doc._id).replaceWith(template);
    } else {
      $('#showcase-list').append(template);
    }
  };

  var clickEvent = function () {
    $('.column').unbind('click');
    $('.column').on('click', function (e) {
      e.preventDefault();
      console.log($(this).hasClass('full-width'));
      if ($(this).hasClass('full-width')) {
        $(this).removeClass('full-width');
      } else {
        var recordId = $(this).attr('id');
        console.log(recordId);
        db.get(recordId, {
          include_docs: true,
        }).then(function (data) {
          $('#' + recordId).addClass('full-width');
        }).catch(function (err) {
          console.log(err);
        });
      }
      return false;
    });
  }
});
