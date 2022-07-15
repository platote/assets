bl_info = {
    "name" : ".VRM NAKED WASSIE",
    "description" : "Generate a .VRM NAKED WASSIE",
    "author" : "Platote",
    "version" : (0, 0, 1),
    "blender" : (2, 80, 0),
    "location" : "View3D",
    "warning" : "",
    "support" : "COMMUNITY",
    "doc_url" : "",
    "category" : "3D View"
}

from pydoc import describe
import bpy
import os 
from bpy.types import Operator
from bpy.types import Panel


class TLA_PT_sidebar(Panel):
    """Display test button"""
    bl_label = "WASSIE"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "WASSIE"

   

    def draw(self, context):
        col = self.layout.column(align=True)
        prop = col.operator(TLA_OT_operator.bl_idname, text="Generate Wassie")
        row = self.layout.row()
        row.prop(context.scene, "mytool_color1")
        row.prop(context.scene, "mytool_color2")
 


class TLA_OT_operator(Operator):
    """ tooltip goes here """
    bl_idname = "demo.operator"
    bl_label = "Select eye type"
    bl_options = {"REGISTER", "UNDO"}

    @classmethod
    def poll(cls, context):
        return context.mode == "OBJECT"

    preset_enum : bpy.props.EnumProperty(
        name = "",
        description="select an option",
        items = [
            ('Wassie', 'Wassie', ""),
            ('Surprised', 'Surprised', ""),
            ('Realistic', 'Realistic', ""),
            ('Eyelashes', 'Eyelashes', ""),
            ('Focused', 'Focused', ""),
            ('Incompetent', 'Incompetent', ""),
            ('Lashes', 'Lashes', ""),
            ('Realistic', 'Realistic', ""),
            ('Small', 'Small', ""),
            ('Surprised', 'Surprised', "")
        ]
    )

    def invoke(self, context, event):
        wm = context.window_manager
        return wm.invoke_props_dialog(self)

    def draw(self, context):
        layout = self.layout
        layout.prop(self, "preset_enum")

    def execute(self, context):

        eyes_type = self.preset_enum

        body = os.path.join(os.path.dirname(bpy.data.filepath), "Bodies/Body_Wassie.fbx")
        beak = os.path.join(os.path.dirname(bpy.data.filepath), "Beaks/Beak_Wassie.fbx")
        feet = os.path.join(os.path.dirname(bpy.data.filepath), "Feet/Feet_Wassie.fbx")
        eyes = os.path.join(os.path.dirname(bpy.data.filepath), f"Eyes/Eyes_{eyes_type}.fbx")
      
        # body = f'C:/Users/plato/Documents/assets/wassies/base_assets/Bodies/Body_Wassie.fbx'
        # beak = f'C:/Users/plato/Documents/assets/wassies/base_assets/Beaks/Beak_Wassie.fbx'
        # feet = f'C:/Users/plato/Documents/assets/wassies/base_assets/Feet/Feet_Wassie.fbx'
        # eyes = f'C:/Users/plato/Documents/assets/wassies/base_assets/Eyes/Eyes_{eyes_type}.fbx'

        bpy.ops.import_scene.fbx(filepath=body)
        bpy.ops.import_scene.fbx(filepath=beak)
        bpy.ops.import_scene.fbx(filepath=feet)
        bpy.ops.import_scene.fbx(filepath=eyes)

        objects = bpy.data.objects

        body = objects['Body_Wassie']
        beak = objects['Beak_Wassie ']
        eyes = objects[f'Eyes_{eyes_type}']
        feet = objects['Feet_Wassie']
        armature = objects['Armature']

        used_mesh = [body, beak, eyes, feet]

        for mesh in used_mesh: 
            mesh.data.use_auto_smooth = 0
        
        def applyingTexture_colors(path, obj, outline):
            mat = bpy.data.materials.new(name="Base Material")
            mat.use_nodes = True
            nodes = mat.node_tree.nodes
            links = mat.node_tree.links
            links.clear()
            nodes.clear()
            matcap = nodes.new("ShaderNodeGroup")
            matcap.node_tree = bpy.data.node_groups['matcap_vector']
            sphImage = nodes.new('ShaderNodeTexImage')
            sphImage.image = bpy.data.images.load(os.path.join(os.path.dirname(bpy.data.filepath), "matcap/T_Matcap_MC.png"))
            shader = nodes.new("ShaderNodeGroup")
            shader.node_tree = bpy.data.node_groups['MToon_unversioned']
            output = nodes.new(type='ShaderNodeOutputMaterial')
            links.new(shader.outputs[0], output.inputs[0])
            texImage = nodes.new('ShaderNodeTexImage')
            texImage.image = bpy.data.images.load(path)
            color_ramp = nodes.new('ShaderNodeValToRGB')

            color_ramp.color_ramp.elements[0].color = context.scene.mytool_color1
            color_ramp.color_ramp.elements[1].color = context.scene.mytool_color2
            links.new(color_ramp.inputs[0], texImage.outputs['Color'])
            links.new(shader.inputs['MainTexture'], color_ramp.outputs['Color'])
            links.new(shader.inputs['ShadeTexture'], color_ramp.outputs['Color'])
            links.new(sphImage.inputs['Vector'], matcap.outputs['Vector'])
            links.new(shader.inputs['SphereAddTexture'], sphImage.outputs['Color'])
            if outline:
                shader.inputs['OutlineWidthMode'].default_value = 1.0
                shader.inputs['OutlineWidth'].default_value = 0.133
            obj.data.materials[0] = mat

        def applyingTexture(path, obj, outline):
            mat = bpy.data.materials.new(name="Base Material")
            mat.use_nodes = True
            nodes = mat.node_tree.nodes
            links = mat.node_tree.links
            links.clear()
            nodes.clear()
            matcap = nodes.new("ShaderNodeGroup")
            matcap.node_tree = bpy.data.node_groups['matcap_vector']
            sphImage = nodes.new('ShaderNodeTexImage')
            sphImage.image = bpy.data.images.load(os.path.join(os.path.dirname(bpy.data.filepath), "matcap/T_Matcap_MC.png"))
            shader = nodes.new("ShaderNodeGroup")
            shader.node_tree = bpy.data.node_groups['MToon_unversioned']
            output = nodes.new(type='ShaderNodeOutputMaterial')
            links.new(shader.outputs[0], output.inputs[0])
            texImage = nodes.new('ShaderNodeTexImage')
            texImage.image = bpy.data.images.load(path)
            links.new(shader.inputs['MainTexture'], texImage.outputs['Color'])
            links.new(shader.inputs['ShadeTexture'], texImage.outputs['Color'])

            links.new(sphImage.inputs['Vector'], matcap.outputs['Vector'])
            links.new(shader.inputs['SphereAddTexture'], sphImage.outputs['Color'])
            if outline:
                shader.inputs['OutlineWidthMode'].default_value = 1.0
                shader.inputs['OutlineWidth'].default_value = 0.133
            obj.data.materials[0] = mat


        body_texture = os.path.join(os.path.dirname(bpy.data.filepath), "Bodies/Body_Wassie_TXTR.tga")
        beak_texture = os.path.join(os.path.dirname(bpy.data.filepath), "Beaks/Beak_Wassie_TXTR.tga")
        eyes_texture = os.path.join(os.path.dirname(bpy.data.filepath), f"Eyes/Eyes_{eyes_type}_TXTR.tga")
        feet_texture = os.path.join(os.path.dirname(bpy.data.filepath), "Feet/Feet_Wassie_TXTR.tga")
      
        applyingTexture_colors(body_texture, body, False)
        applyingTexture(beak_texture, beak, True)
        applyingTexture(eyes_texture, eyes, False)
        applyingTexture(feet_texture, feet, True)

        def vertices_to_bone(obj, bone):
            group = obj.vertex_groups.new(name = bone)
            group.add(list(range(0, len(obj.data.vertices))), 1.0, 'ADD')

        def parentAtoB(a, b, mode):
            bpy.ops.object.select_all(action='DESELECT')
            a.select_set(True)
            b.select_set(True)
            bpy.context.view_layer.objects.active = b
            bpy.ops.object.parent_set(type=mode)
            bpy.ops.object.select_all(action='DESELECT')

        vertices_to_bone(eyes, 'head')
        vertices_to_bone(beak, 'head')
        parentAtoB(eyes, armature, 'ARMATURE_NAME')
        parentAtoB(beak, armature, 'ARMATURE_NAME')
        parentAtoB(feet, armature, 'ARMATURE_AUTO')

        namelist = [("neck 1", "neck"), 
            ("spine2","spine"), 
            ("spine1", "hips"), 
            ("legs.L", "lower_leg.L"), 
            ("legs.R", "lower_leg.R")]

        for name, newname in namelist:
            # get the pose bone with name
            pb = armature.pose.bones.get(name)
            # continue if no bone of that name
            if pb is None:
                continue
            # rename
            pb.name = newname
            
        dict = {0: ['A'], 1: ['E'], 2: ['U'], 3: ['I'], 4: ['O'], 5: ['Blink', 'Close Both'], 6: ['Joy', 'Happy'], 7: ['Angry', 'Angry'], 8: ['Sorrow', 'Sad'], 9: ['Fun', 'Happy'] }

        print(armature.data.name)

        for i in dict:
            bpy.ops.vrm.add_vrm0_blend_shape_group(armature_name=armature.name, name=dict[i][0])
            bpy.ops.vrm.add_vrm0_blend_shape_bind(armature_name=armature.name, blend_shape_group_index=i)
            if i < 5:
                blend_shape_groups = bpy.context.object.data.vrm_addon_extension.vrm0.blend_shape_master.blend_shape_groups[i].binds[0]
                blend_shape_groups.mesh.value = beak.data.name
                blend_shape_groups.index = dict[i][0]
                blend_shape_groups.weight = 1
            else:
                blend_shape_groups = bpy.context.object.data.vrm_addon_extension.vrm0.blend_shape_master.blend_shape_groups[i].binds[0]
                blend_shape_groups.mesh.value = eyes.data.name
                blend_shape_groups.index = dict[i][1]
                blend_shape_groups.weight = 1


        self.report({'INFO'},
            f"execute()")

        return {'FINISHED'}



classes = [
    TLA_OT_operator,
    TLA_PT_sidebar,
]

def register():
    
    for c in classes:
        bpy.utils.register_class(c)

    bpy.types.Scene.my_float = bpy.props.FloatProperty(
        name='Float',
        default=0.0 
    )
    bpy.types.Scene.mytool_color1 = bpy.props.FloatVectorProperty(
                 name = "Belly Color",
                 subtype = "COLOR",
                 size = 4,
                 min = 0.0,
                 max = 1.0,
                 default = (1.0,1.0,1.0,1.0))
    bpy.types.Scene.mytool_color2 = bpy.props.FloatVectorProperty(
                 name = "Back Color",
                 subtype = "COLOR",
                 size = 4,
                 min = 0.0,
                 max = 1.0,
                 default = (1.0,1.0,1.0,1.0))
        
def unregister():
    del bpy.types.Scene.my_float
    del bpy.types.Scene.my_bool
    del bpy.types.Scene.mytool_color1
    del bpy.types.Scene.mytool_color2
    for c in classes:
        bpy.utils.unregister_class(c)


if __name__ == '__main__':
    register()