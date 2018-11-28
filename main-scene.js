window.Assignment_Three_Scene = window.classes.Assignment_Three_Scene =
class Assignment_Three_Scene extends Scene_Component
  { constructor( context, control_box )    
      { super(   context, control_box );    
        if( !context.globals.has_controls   ) 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 

        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,0,10 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );

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

        this.king_Fish_Matrix = Mat4.identity(); 
        //this.king_Fish_Matrix = this.king_Fish_Matrix.times( Mat4.scale([2, .5, 2]));

        this.mystery_Fish_Matrix = Mat4.identity(); 
        this.mystery_Fish_Matrix = this.mystery_Fish_Matrix.times( Mat4.translation([0, 2, 0]))
                                                           .times( Mat4.scale([2, .5, 2]));

        this.plain_Fish_Matrix = Mat4.identity(); 
        this.plain_Fish_Matrix = this.plain_Fish_Matrix.times( Mat4.translation([3, 2, 0]))
                                                       .times( Mat4.scale([.5, .5, .5]));
                                                   
        this.small_Fry_Matrix = Mat4.identity(); 
        this.small_Fry_Matrix = this.small_Fry_Matrix.times( Mat4.translation([5, 2, 0]))
                                                     .times( Mat4.scale([.5, .5, .5]));

        this.touchy_Fish_Matrix = Mat4.identity(); 
        this.touchy_Fish_Matrix = this.touchy_Fish_Matrix.times( Mat4.translation([7, 2, 0]))
                                                         .times( Mat4.scale([.5, .5, .5]));

        this.nibbler_Matrix = Mat4.identity(); 
        this.nibbler_Matrix = this.nibbler_Matrix.times( Mat4.translation([9, 2, 0]))
                                                 .times( Mat4.scale([.5, .5, .5]));         

        this.pond_Matrix = Mat4.identity();
        this.pond_Matrix = this.pond_Matrix.times( Mat4.translation([0, 0, -1]))
                                           .times( Mat4.scale([10, 10, .01]));  

        //this.rand;            
      }

    make_control_panel()
      { 
        //this.key_triggered_button( "Start/Stop Rotation", [ "c" ], this.start_stop );
      }

    display( graphics_state )
      { graphics_state.lights = this.lights;        
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;
        
        let model_transform = Mat4.identity();

        this.shapes.sphere6.draw( graphics_state, this.pond_Matrix, this.materials.phong);
        
        var denominator = Math.floor(t%10) + 1;
        
        var king_Fish_Rad = 2 * Math.PI / denominator;
        if(Math.abs(this.king_Fish_Matrix[0][3]) > 6 || Math.abs(this.king_Fish_Matrix[1][3]) > 6)
        {
             king_Fish_Rad += Math.PI;
        }
        model_transform = this.king_Fish_Matrix.times( Mat4.translation([(0.05) * Math.cos(king_Fish_Rad), (0.05) * Math.sin(king_Fish_Rad), 0]));
        this.king_Fish_Matrix = model_transform;
        model_transform = model_transform.times( Mat4.rotation( king_Fish_Rad, Vec.of(0, 0, 1)))
                                         .times( Mat4.scale([2, .5, 2]));
        this.shapes.plane.draw( graphics_state, model_transform, this.materials.king_Fish);  
        

        this.shapes.plane.draw( graphics_state, this.mystery_Fish_Matrix,       this.materials.mystery_Fish        );
        this.shapes.plane.draw( graphics_state, this.plain_Fish_Matrix,         this.materials.plain_Fish          );
        this.shapes.plane.draw( graphics_state, this.small_Fry_Matrix,          this.materials.small_Fry           );
        this.shapes.plane.draw( graphics_state, this.touchy_Fish_Matrix,        this.materials.touchy_Fish         );
        this.shapes.plane.draw( graphics_state, this.nibbler_Matrix,            this.materials.nibbler             );
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
