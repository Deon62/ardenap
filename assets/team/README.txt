TEAM PHOTOS
===========

Drop team member photos in this folder, then wire each one up in team.html.

Specs
-----
  Shape     Square (1:1). The card crops to a square and anchors to the top of
            the image, so leave a little headroom and don't crop the chin.
  Size      1000 x 1000 px or larger. Anything under 600px will look soft.
  Format    .jpg for photos, .webp if you have it. Keep each file under 300KB.
  Naming    lowercase, no spaces — e.g. amina.jpg, brian-otieno.jpg

Wiring one up
-------------
In team.html, find the member's <article class="team-card team-card-placeholder">
block and make three changes:

  1. Replace this line:
         <span class="team-monogram">AA</span>
     with:
         <img src="assets/team/amina.jpg" alt="Amina Wanjiru" loading="lazy" />

  2. Delete the line:
         <span class="team-placeholder-flag">Add name</span>
     and put the person's real name in the <h3>, moving their job title into
     the <div class="team-role"> underneath.

  3. Remove "team-card-placeholder" from the article's class list, leaving:
         <article class="team-card" data-anim="up" style="--delay:60ms">

Also replace the "#" in that card's <a class="team-link"> hrefs with their real
LinkedIn / GitHub / portfolio URLs, or delete the links you don't need.

Until a photo is added the card shows a monogram, so the page stays presentable
with any mix of filled-in and pending members.
