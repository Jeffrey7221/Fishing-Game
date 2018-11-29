window.Fishing_Game = window.classes.Fishing_Game =
class Fishing_Game extends Scene_Component
  { constructor( context, control_box )    
      { super(   context, control_box );    
        if( !context.globals.has_controls   ) 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 

        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,0,20 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

        const shapes = { box:       new Cube(),
                         plane:     new Square(),
                         sphere6:   new Subdivision_Sphere(6),
                       }
        this.submit_shapes( context, shapes );

        this.materials =
          { phong:          context.get_instance( Phong_Shader ).material( Color.of( 0,0,1,1 ) ),
            king_Fish:      context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), { ambient: 1, texture: context.get_instance( "assets/King_Of_The_Pond.png", false ) } ),
            mystery_Fish:   context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), { ambient: 1, texture: context.get_instance( "assets/Mystery_Fish.png", false ) } ),
            plain_Fish:     context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), { ambient: 1, texture: context.get_instance( "assets/Plain_Ol_Fish.png", false ) } ),
            small_Fry:      context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), { ambient: 1, texture: context.get_instance( "assets/Small_Fry.png", false ) } ),
            touchy_Fish:    context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), { ambient: 1, texture: context.get_instance( "assets/Touchy_Fish.png", false ) } ),
            nibbler:        context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), { ambient: 1, texture: context.get_instance( "assets/Nibbler.png", false ) } ),
          }

        this.lights = [ new Light( Vec.of( -5,5,5,1 ), Color.of( 0,1,1,1 ), 100000 ) ];

        this.king_Fish_Matrix = Mat4.identity().times( Mat4.translation([0, 0, -0.15]));  
        this.king_angle = 0
        this.king_model_spawn = Mat4.identity().times( Mat4.scale([.2, .05, .2]));
        this.king_spawn_time = Math.random() * 12 + 1;
        this.king_dist = 0.01;

        this.mystery_Fish_Matrix = Mat4.identity().times( Mat4.translation([0, 0, -0.1])); 
        this.mystery_angle = 0;
        this.mystery_model_spawn = Mat4.identity().times( Mat4.scale([.2, .05, .2]));
        this.mystery_spawn_time = Math.random() * 12 + 10;

        this.plain_Fish_Matrix = Mat4.identity().times( Mat4.translation([Math.random() * 2 - 1, Math.random() * 2 - 1, 0]));
        this.plain_angle = Math.random() * 2 * Math.PI;
        this.plain_model_spawn = Mat4.identity().times( Mat4.scale([.005, .005, .005]));
        this.plain_spawn_time = Math.random() * 3;

        this.plain1_Fish_Matrix = Mat4.identity().times( Mat4.translation([Math.random() * 2 - 1, Math.random() * 2 - 1, -0.05]));
        this.plain1_angle = Math.random() * 2 * Math.PI;
        this.plain1_model_spawn = Mat4.identity().times( Mat4.scale([.005, .005, .005]));
        this.plain1_spawn_time = Math.random() * 3;

        this.plain2_Fish_Matrix = Mat4.identity().times( Mat4.translation([Math.random() * 2 - 1, Math.random() * 2 - 1, -0.05]));
        this.plain2_angle = Math.random() * 2 * Math.PI;
        this.plain2_model_spawn = Mat4.identity().times( Mat4.scale([.005, .005, .005]));
        this.plain2_spawn_time = Math.random() * 3;

        this.small_Fry_Matrix = Mat4.identity();
        this.fry_angle = Math.random() * 2 * Math.PI;
        this.fry_model_spawn = Mat4.identity().times( Mat4.scale([.005, .005, .005]));
        this.fry_spawn_time = Math.random() * 3;
        this.fry_dist = 0.01;

        this.small_Fry1_Matrix = Mat4.identity();
        this.fry1_angle = Math.random() * 2 * Math.PI;
        this.fry1_model_spawn = Mat4.identity().times( Mat4.scale([.005, .005, .005]));
        this.fry1_spawn_time = Math.random() * 3;
        this.fry1_dist = 0.01;
	
        this.touchy_Fish_Matrix = Mat4.identity(); 
        this.touchy_Fish_Matrix = this.touchy_Fish_Matrix.times( Mat4.translation([7, 2, 0]))
                                                         .times( Mat4.scale([.5, .5, .5]));

        this.nibbler_Matrix = Mat4.identity(); 
        this.nibbler_Matrix = this.nibbler_Matrix.times( Mat4.translation([9, 2, 0]))
                                                 .times( Mat4.scale([.5, .5, .5]));         

        this.pond_Matrix = Mat4.identity();
        this.pond_Matrix = this.pond_Matrix.times( Mat4.translation([0, 0, -1]))
                                           .times( Mat4.scale([10, 10, .01]));  

        this.pause = true;            
      }

    make_control_panel()
      { 
        this.key_triggered_button( "Resume/Pause Game", [ "c" ], this.pause_resume );
      }
    
    pause_resume()
     {
        this.pause = !this.pause;   
     }

    // ***************************** BEGIN ANGLE HELPER FUNCTIONS ***************************** 
    
    random_king_angle()
     {
        var current_angle = Math.atan2( (this.king_Fish_Matrix[1][3]) , (this.king_Fish_Matrix[0][3]) );
        this.king_angle = (current_angle + Math.PI) - (0.25 * Math.PI) + (Math.random() * 0.5 * Math.PI);
     }

    random_mystery_angle()
      {
         var current_angle = Math.atan2( (this.mystery_Fish_Matrix[1][3]) , (this.mystery_Fish_Matrix[0][3]) );
         this.mystery_angle = (current_angle + Math.PI) - (0.25 * Math.PI) + (Math.random() * 0.5 * Math.PI);
      }

    random_plain_angle()
      {
         var current_angle = Math.atan2( (this.plain_Fish_Matrix[1][3]) , (this.plain_Fish_Matrix[0][3]) );
         this.plain_angle = (current_angle + Math.PI) - (0.25 * Math.PI) + (Math.random() * 0.5 * Math.PI);
      }

    random_plain1_angle()
      {
         var current_angle = Math.atan2( (this.plain1_Fish_Matrix[1][3]) , (this.plain1_Fish_Matrix[0][3]) );
         this.plain1_angle = (current_angle + Math.PI) - (0.25 * Math.PI) + (Math.random() * 0.5 * Math.PI);
      }

    random_plain2_angle()
      {
         var current_angle = Math.atan2( (this.plain2_Fish_Matrix[1][3]) , (this.plain2_Fish_Matrix[0][3]) );
         this.plain2_angle = (current_angle + Math.PI) - (0.25 * Math.PI) + (Math.random() * 0.5 * Math.PI);
      }

    random_fry_angle()
      {
         var current_angle = Math.atan2( (this.small_Fry_Matrix[1][3]) , (this.small_Fry_Matrix[0][3]) );
         this.fry_angle = (current_angle + Math.PI) - (0.25 * Math.PI) + (Math.random() * 0.5 * Math.PI);
      }

    random_fry1_angle()
      {
         var current_angle = Math.atan2( (this.small_Fry1_Matrix[1][3]) , (this.small_Fry_Matrix[0][3]) );
         this.fry1_angle = (current_angle + Math.PI) - (0.25 * Math.PI) + (Math.random() * 0.5 * Math.PI);
      }       

    // ***************************** END ANGLE HELPER FUNCTIONS ***************************** 
     
    display( graphics_state )
      { 
        graphics_state.lights = this.lights;        
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

        // Draw flattened blue sphere for temporary pond:
        this.shapes.sphere6.draw( graphics_state, this.pond_Matrix, this.materials.phong);

        // ***************************** BEGIN KING OF THE POND *****************************
        
        let king_model_transform = Mat4.identity();

        // If statement to turn fish if it will translate out of pond, needs slight adjustment for detection of pond in certain quadrants
        if((Math.abs(this.king_Fish_Matrix[0][3] + 2 * Math.cos(this.king_angle)) > 5.5 || Math.abs(this.king_Fish_Matrix[1][3] + 0.8 * Math.sin(this.king_angle)) > 5.5) && Math.round( (t % 0.3) * 10) / 10 == 0)
        {
            this.random_king_angle();
        }

        // Code block to draw King fish      
        if(t > this.king_spawn_time && t < this.king_spawn_time + 0.2)
        {
          if(this.king_model_spawn[0][0] < 2)
          {
              if(Math.round( (t % 0.1) * 10) / 10 == 0)
              {
                  this.king_model_spawn = this.king_model_spawn.times( Mat4.scale([1.4, 1.4, 1.4])); 
              }
          }
          this.shapes.plane.draw( graphics_state, this.king_model_spawn, this.materials.king_Fish);
        }

        if(t > this.king_spawn_time + 0.2)
        {
            king_model_transform = this.king_Fish_Matrix.times( Mat4.translation([(6 / (t - this.king_dist)) * (0.05) * Math.cos(this.king_angle), (6 / (t - this.king_dist)) * (0.05) * Math.sin(this.king_angle), 0]));

            if( 6 / (t - this.king_dist) < 0.6)
            {
                this.king_dist += 9;
            }

            if( t - this.king_dist > 10 )
            {
                this.king_dist += 9;
            }

            this.king_Fish_Matrix = king_model_transform;
            king_model_transform = king_model_transform.times( Mat4.rotation( this.king_angle, Vec.of(0, 0, 1)))
            king_model_transform = king_model_transform.times( Mat4.scale([2, .5, 2]));
            this.shapes.plane.draw( graphics_state, king_model_transform, this.materials.king_Fish);
        }     
   
        // ***************************** END KING OF THE POND *****************************  
        
        // ***************************** BEGIN MYSTERY FISH *****************************

        let mystery_model_transform = Mat4.identity();

        // If statement to turn fish if it will translate out of pond, needs slight adjustment for detection of pond in certain quadrants
        if((Math.abs(this.mystery_Fish_Matrix[0][3] + 2 * Math.cos(this.mystery_angle)) > 5.5 || Math.abs(this.mystery_Fish_Matrix[1][3] + 0.5 * Math.sin(this.mystery_angle)) > 5.5) && Math.round( (t % 0.5) * 10) / 10 == 0)
        {
            this.random_mystery_angle();
        }
        
        // Code block to draw Mystery fish      
        if(t > this.mystery_spawn_time && t < this.mystery_spawn_time + 0.2)
        {
          if(this.mystery_model_spawn[0][0] < 2)
          {
              if(Math.round( (t % 0.1) * 10) / 10 == 0)
              {
                  this.mystery_model_spawn = this.mystery_model_spawn.times( Mat4.scale([1.4, 1.4, 1.4])); 
              }
          }
          this.shapes.plane.draw( graphics_state, this.mystery_model_spawn, this.materials.mystery_Fish);
        }

        if(t > this.mystery_spawn_time + 0.2)
        {
            mystery_model_transform = this.mystery_Fish_Matrix.times( Mat4.translation([(0.1) * Math.cos(this.mystery_angle), (0.1) * Math.sin(this.mystery_angle), 0]));
            this.mystery_Fish_Matrix = mystery_model_transform;
            mystery_model_transform = mystery_model_transform.times( Mat4.rotation( this.mystery_angle, Vec.of(0, 0, 1)))
            mystery_model_transform = mystery_model_transform.times( Mat4.scale([2, .5, 2]));
            this.shapes.plane.draw( graphics_state, mystery_model_transform, this.materials.mystery_Fish);
        }     

        // ***************************** END MYSTERY FISH *****************************  

        // ***************************** BEGIN PLAIN FISH *****************************

        let plain_model_transform = Mat4.identity();
        
        // If statement to turn fish if it will translate out of pond, needs slight adjustment for detection of pond in certain quadrants
        if((Math.abs(this.plain_Fish_Matrix[0][3] + .5 * Math.cos(this.plain_angle)) > 5 || Math.abs(this.plain_Fish_Matrix[1][3] + 0.25 * Math.sin(this.plain_angle)) > 5) && Math.round( (t % 0.5) * 10) / 10 == 0)
        {
            this.random_plain_angle();
        }
        
        // Code block to draw Plain fish      
        if(t > this.plain_spawn_time && t < this.plain_spawn_time + 0.2)
        {
          if(this.plain_model_spawn[0][0] < .5)
          {
              if(Math.round( (t % 0.1) * 10) / 10 == 0)
              {
                  this.plain_model_spawn = this.plain_model_spawn.times( Mat4.scale([1.1, 1.1, 1.1])); 
              }
          }
          this.shapes.plane.draw( graphics_state, this.plain_model_spawn, this.materials.plain_Fish);
        }

        if(t > this.plain_spawn_time + 0.2)
        {
            plain_model_transform = this.plain_Fish_Matrix.times( Mat4.translation([(0.05) * Math.cos(this.plain_angle), (0.05) * Math.sin(this.plain_angle), 0]));
            this.plain_Fish_Matrix = plain_model_transform;
            plain_model_transform = plain_model_transform.times( Mat4.rotation( this.plain_angle, Vec.of(0, 0, 1)))
            plain_model_transform = plain_model_transform.times( Mat4.scale([.5, .5, .5]));
            this.shapes.plane.draw( graphics_state, plain_model_transform, this.materials.plain_Fish);
        }      

        // ***************************** END PLAIN FISH *****************************  
        
        // ***************************** BEGIN PLAIN1 FISH *****************************

        let plain1_model_transform = Mat4.identity();
        
        // If statement to turn fish if it will translate out of pond, needs slight adjustment for detection of pond in certain quadrants
        if((Math.abs(this.plain1_Fish_Matrix[0][3] + .5 * Math.cos(this.plain1_angle)) > 5 || Math.abs(this.plain1_Fish_Matrix[1][3] + 0.25 * Math.sin(this.plain1_angle)) > 5) && Math.round( (t % 0.5) * 10) / 10 == 0)
        {
            this.random_plain1_angle();
        }
        
        // Code block to draw plain1 fish      
        if(t > this.plain1_spawn_time && t < this.plain1_spawn_time + 0.2)
        {
          if(this.plain1_model_spawn[0][0] < .5)
          {
              if(Math.round( (t % 0.1) * 10) / 10 == 0)
              {
                  this.plain1_model_spawn = this.plain1_model_spawn.times( Mat4.scale([1.1, 1.1, 1.1])); 
              }
          }
          this.shapes.plane.draw( graphics_state, this.plain1_model_spawn, this.materials.plain_Fish);
        }

        if(t > this.plain1_spawn_time + 0.2)
        {
            plain1_model_transform = this.plain1_Fish_Matrix.times( Mat4.translation([(0.05) * Math.cos(this.plain1_angle), (0.05) * Math.sin(this.plain1_angle), 0]));
            this.plain1_Fish_Matrix = plain1_model_transform;
            plain1_model_transform = plain1_model_transform.times( Mat4.rotation( this.plain1_angle, Vec.of(0, 0, 1)))
            plain1_model_transform = plain1_model_transform.times( Mat4.scale([.5, .5, .5]));
            this.shapes.plane.draw( graphics_state, plain1_model_transform, this.materials.plain_Fish);
        }      

        // ***************************** END PLAIN1 FISH *****************************  

        // ***************************** BEGIN PLAIN2 FISH *****************************

        let plain2_model_transform = Mat4.identity();
        
        // If statement to turn fish if it will translate out of pond, needs slight adjustment for detection of pond in certain quadrants
        if((Math.abs(this.plain2_Fish_Matrix[0][3] + .5 * Math.cos(this.plain2_angle)) > 5 || Math.abs(this.plain2_Fish_Matrix[1][3] + 0.25 * Math.sin(this.plain2_angle)) > 5) && Math.round( (t % 0.5) * 10) / 10 == 0)
        {
            this.random_plain2_angle();
        }
        
        // Code block to draw plain2 fish      
        if(t > this.plain2_spawn_time && t < this.plain2_spawn_time + 0.2)
        {
          if(this.plain2_model_spawn[0][0] < .5)
          {
              if(Math.round( (t % 0.1) * 10) / 10 == 0)
              {
                  this.plain2_model_spawn = this.plain2_model_spawn.times( Mat4.scale([1.1, 1.1, 1.1])); 
              }
          }
          this.shapes.plane.draw( graphics_state, this.plain2_model_spawn, this.materials.plain_Fish);
        }

        if(t > this.plain2_spawn_time + 0.2)
        {
            plain2_model_transform = this.plain2_Fish_Matrix.times( Mat4.translation([(0.05) * Math.cos(this.plain2_angle), (0.05) * Math.sin(this.plain2_angle), 0]));
            this.plain2_Fish_Matrix = plain2_model_transform;
            plain2_model_transform = plain2_model_transform.times( Mat4.rotation( this.plain2_angle, Vec.of(0, 0, 1)))
            plain2_model_transform = plain2_model_transform.times( Mat4.scale([.5, .5, .5]));
            this.shapes.plane.draw( graphics_state, plain2_model_transform, this.materials.plain_Fish);
        }      

        // ***************************** END PLAIN2 FISH *****************************  

        // ***************************** BEGIN SMALL FRY *****************************

        let fry_model_transform = Mat4.identity();
        
        // If statement to turn fish if it will translate out of pond, needs slight adjustment for detection of pond in certain quadrants
        if((Math.abs(this.small_Fry_Matrix[0][3] + .3 * Math.cos(this.fry_angle)) > 5 || Math.abs(this.small_Fry_Matrix[1][3] + 0.15 * Math.sin(this.fry_angle)) > 5) && Math.round( (t % 0.2) * 10) / 10 == 0)
        {
            this.random_fry_angle();
        }
        
        // Code block to draw Plain fish      
        if(t > this.fry_spawn_time && t < this.fry_spawn_time + 0.2)
        {
          if(this.fry_model_spawn[0][0] < .25)
          {
              if(Math.round( (t % 0.1) * 10) / 10 == 0)
              {
                  this.fry_model_spawn = this.fry_model_spawn.times( Mat4.scale([1.1, 1.1, 1.1])); 
              }
          }
          this.shapes.plane.draw( graphics_state, this.fry_model_spawn, this.materials.small_Fry);
        }

        if(t > this.fry_spawn_time + 0.2)
        {
            fry_model_transform = this.small_Fry_Matrix.times( Mat4.translation([(4 / (t - this.fry_dist)) * (0.1) * Math.cos(this.fry_angle), (4 / (t - this.fry_dist)) * (0.1) * Math.sin(this.fry_angle), 0]));

            if( 4 / (t - this.fry_dist) < 0.8)
            {
                this.fry_dist += 4;
            }

            if( t - this.fry_dist > 10 )
            {
                this.fry_dist += 9;
            }

            this.small_Fry_Matrix = fry_model_transform;
            fry_model_transform = fry_model_transform.times( Mat4.rotation( this.fry_angle, Vec.of(0, 0, 1)))
            fry_model_transform = fry_model_transform.times( Mat4.scale([.3, .3, .3]));
            this.shapes.plane.draw( graphics_state, fry_model_transform, this.materials.small_Fry);
        }      

        // ***************************** END SMALL FRY ***************************** 

        //this.shapes.plane.draw( graphics_state, this.small_Fry_Matrix,          this.materials.small_Fry           );
        //this.shapes.plane.draw( graphics_state, this.touchy_Fish_Matrix,        this.materials.touchy_Fish         );
        //this.shapes.plane.draw( graphics_state, this.nibbler_Matrix,            this.materials.nibbler             );
      }
  }

class Texture_Scroll_X extends Phong_Shader
{ fragment_glsl_code()           
    {
      return `
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.di
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
            return;
          }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
                                            // Phong shading is not to be confused with the Phong Reflection Model.
          vec2 mVector = f_tex_coord; 
          mat4 mMatrix = mat4(vec4(1., 0., 0., 0.), vec4(0., 1., 0., 0.), vec4( 0., 0., 1., 0.), vec4( mod(2.0 * animation_time, 88.) , 0., 0., 1.)); 
          vec4 tempVector = vec4(mVector, 0, 0); 
          tempVector = tempVector + vec4(1., 1., 0., 1.); 
          tempVector = mMatrix * tempVector; 

          vec4 tex_color = texture2D( texture, tempVector.xy );                         // Sample the texture image in the correct place.
                                                                                      // Compute an initial (ambient) color:
          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
    }
}

class Texture_Rotate extends Phong_Shader
{ fragment_glsl_code()          
    {
      return `
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
            return;
          }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
                                            // Phong shading is not to be confused with the Phong Reflection Model.

          vec2 mVector = f_tex_coord; 
          mat4 mMatrix = mat4(cos( mod((6.28) * .25 * animation_time, 44. * 3.14)), sin( mod((6.28) * .25 * animation_time, 44. * 3.14)), 0, 0, -sin( mod((6.28) * .25 * animation_time, 44. * 3.14)), cos( mod((6.28) * .25 * animation_time, 44. * 3.14)), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          vec4 tempVector = vec4(mVector, 0, 0); 
          tempVector = tempVector + vec4(-.5, -.5, 0., 0.);
          tempVector = mMatrix * tempVector; 
          tempVector = tempVector + vec4(.5, .5, 0., 0.);
          
          vec4 tex_color = texture2D( texture, tempVector.xy );                         // Sample the texture image in the correct place.
                                                                                      // Compute an initial (ambient) color:
          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
    }
}
