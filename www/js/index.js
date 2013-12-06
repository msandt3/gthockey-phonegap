/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
    deviceready : function(){

        $( document ).bind( "mobileinit", function() {
            $.support.cors                 = true;
            $.mobile.allowCrossDomainPages = true;
        });
        // Prevents all anchor click handling
            $.mobile.linkBindingEnabled = false;

            // Disabling this will prevent jQuery Mobile from handling hash changes
            $.mobile.hashListeningEnabled = false;

            //AJAX PREFILTER
            $.ajaxPrefilter(function(options, originalOptions, jqXHR){
                options.url = "http://www.gthockey.com/api" + options.url;
            });
            //Collections & Models
            var Game = Backbone.Model.extend({
                urlRoot: '/schedule.php'
            });

            var Player = Backbone.Model.extend({
                urlRoot: '/roster.php'
            });
            var Games = Backbone.Collection.extend({
                url: '/schedule.php'
            });

            var Players = Backbone.Collection.extend({
                url: '/roster.php'
            });

            var PlayerData = Backbone.View.extend({
                el: "#player-content",
                render: function(options){
                    var that = this;
                    
                    if(options.id){
                        var player = new Player();
                        player.fetch({ 
                            data: $.param({ playerid: options.id}),
                            beforeSend: function(){
                                $(".ui-loader").css('display','block');
                            },
                            success: function(player){
                                $(".ui-loader").css('display','none');
                                var template = _.template($('#player-template').html(), {player: player});
                                that.$el.html(template);
                                console.log(player);
                            }
                        });
                    }
                    else{
                        var template = _.template($('#player-template').html(), {player: null});
                        that.$el.html(template);
                    }
                }
            });

            var GameData = Backbone.View.extend({
                el: "#game-content",
                render: function(options){
                    var that = this;
                    if(options.id){
                        var game = new Game();
                        game.fetch({
                            data: $.param({ gameid: options.id}),
                            beforeSend: function(){
                                $(".ui-loader").css('display','block');
                            },
                            success: function(game){
                                $(".ui-loader").css('display','none');
                                var template = _.template($('#game-template').html(), {game: game});
                                that.$el.html(template);
                                console.log(game);
                            }
                        });
                    }
                }
            });

            //Views
            var Schedule = Backbone.View.extend({
                el: '#schedule-content',
                render: function(){
                    var that = this;
                    var games = new Games();
                    games.fetch({
                        beforeSend: function(){
                            $(".ui-loader").css('display','block');
                        },
                        success: function(games){
                            console.log(games);
                            $(".ui-loader").css('display','none');
                            var template = _.template($('#schedule-template').html(), {games:games.models});
                            that.$el.html(template);
                            $('#schedule-table a[data-role=button]').button();
                        }
                    });

                }
            });

            var Roster = Backbone.View.extend({
                el: '#roster-content',
                render: function(){
                    var that = this;
                    var players = new Players();
                    players.fetch({
                        beforeSend: function(){
                            $(".ui-loader").css('display','block');
                        },
                        success: function(players){
                            //set up template
                            $(".ui-loader").css('display','none');
                            var template =  _.template($('#roster-template').html(), {players:players.models});
                            that.$el.html(template);
                            $('#roster-table a[data-role=button]').button();
                        }
                    });
                    
                }
            });

            




            //Router
            var Router = Backbone.Router.extend({
                routes: {
                    '': 'home',
                    'schedule': 'schedule',
                    'roster': 'roster',
                    'game/:id': 'showGame',
                    'player/:id': 'showPlayer',
                    'contact': 'contact',
                    'about': 'about'
                }
            });



            //Declarations 
            var router = new Router();
            var scheduleView = new Schedule();
            var rosterView = new Roster();
            var playerView = new PlayerData();
            var gameView = new GameData();



            //Event Handling
            router.on('route:home',function(){
                $.mobile.changePage("#home",{reverse:true});
            }); 

            router.on('route:schedule',function(){
                scheduleView.render();

                $.mobile.changePage("#schedule",{reverse: true});

                $('#schedule').trigger('create');
            });

            router.on('route:roster',function(){
                rosterView.render();
                $.mobile.changePage("#roster",{reverse:true});
                $("#roster").trigger('create');
            });

            router.on('route:showGame',function(id){
                gameView.render({id:id});
                $.mobile.changePage("#game");
                console.log("SHOW GAME INFO FOR GAME "+id);
            });

            router.on('route:showPlayer',function(id){
                playerView.render({id:id});
                $.mobile.changePage("#player");
                console.log("SHOW PLAYER INFO FOR PLAYER "+id);
            });

            router.on('route:contact',function(){
                $.mobile.changePage("#contact");
                $("#contact").trigger('create');
            });

            router.on('route:about',function(){
                $.mobile.changePage("#about");
                $("#about").trigger('create');
            });

            Backbone.history.start();
    }
};
