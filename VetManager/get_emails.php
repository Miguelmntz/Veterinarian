<?php
$owners = \App\Models\Owner::all();
foreach($owners as $o) {
    echo $o->name . " -> " . $o->email . "\n";
}
