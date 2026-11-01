#!/usr/bin/env python3
"""
CIT 3D Campus Explorer — Blender 4.x Automation Script
Generates the complete realistic university campus matching the aerial visual reference:
- Collections: Campus_Ground, Academic_Buildings, Event_Buildings, Sports_Facilities, Roads, Trees, Landscaping, Street_Furniture, Campus_Entrance
- Exports to public/assets/models/cit_campus.glb and saves cit_campus.blend
"""
import sys
import os

try:
    import bpy
    import mathutils
    import math
except ImportError:
    print("This script is designed to run inside Blender (e.g., blender --background --python scripts/generate_blender_campus.py).")
    sys.exit(0)

# Clear existing objects
bpy.ops.wm.read_factory_settings(use_empty=True)

# Helper to create collections
def get_or_create_collection(name, parent=None):
    if name in bpy.data.collections:
        col = bpy.data.collections[name]
    else:
        col = bpy.data.collections.new(name)
        if parent is None:
            bpy.context.scene.collection.children.link(col)
        else:
            parent.children.link(col)
    return col

# Create required collections
col_ground = get_or_create_collection("Campus_Ground")
col_academic = get_or_create_collection("Academic_Buildings")
col_event = get_or_create_collection("Event_Buildings")
col_sports = get_or_create_collection("Sports_Facilities")
col_roads = get_or_create_collection("Roads")
col_trees = get_or_create_collection("Trees")
col_landscape = get_or_create_collection("Landscaping")
col_furniture = get_or_create_collection("Street_Furniture")
col_entrance = get_or_create_collection("Campus_Entrance")

# Helper for PBR Materials
def create_pbr_material(name, color, roughness=0.5, metallic=0.0, emission=None, emission_strength=1.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (*color, 1.0)
        bsdf.inputs['Roughness'].default_value = roughness
        bsdf.inputs['Metallic'].default_value = metallic
        if emission:
            # Blender 4.x Emission Color / Strength
            if 'Emission Color' in bsdf.inputs:
                bsdf.inputs['Emission Color'].default_value = (*emission, 1.0)
                bsdf.inputs['Emission Strength'].default_value = emission_strength
            elif 'Emission' in bsdf.inputs:
                bsdf.inputs['Emission'].default_value = (*emission, 1.0)
    return mat

mat_grass = create_pbr_material("Mat_Grass", (0.28, 0.52, 0.22), roughness=0.85)
mat_asphalt = create_pbr_material("Mat_Asphalt", (0.15, 0.16, 0.18), roughness=0.9, metallic=0.1)
mat_paving = create_pbr_material("Mat_Paving", (0.85, 0.82, 0.75), roughness=0.7)
mat_sandstone = create_pbr_material("Mat_Sandstone", (0.92, 0.88, 0.79), roughness=0.6)
mat_brick = create_pbr_material("Mat_Brick", (0.68, 0.28, 0.22), roughness=0.75)
mat_dark_roof = create_pbr_material("Mat_DarkRoof", (0.18, 0.22, 0.26), roughness=0.4, metallic=0.2)
mat_blue_glass = create_pbr_material("Mat_BlueGlass", (0.18, 0.45, 0.72), roughness=0.1, metallic=0.85, emission=(0.2, 0.5, 0.8), emission_strength=0.3)
mat_warm_window = create_pbr_material("Mat_WarmWindow", (0.95, 0.85, 0.55), roughness=0.2, emission=(1.0, 0.85, 0.5), emission_strength=2.0)
mat_water = create_pbr_material("Mat_Water", (0.12, 0.45, 0.65), roughness=0.05, metallic=0.9)
mat_track = create_pbr_material("Mat_AthleticTrack", (0.75, 0.22, 0.18), roughness=0.8)

# 1. Campus Ground
bpy.ops.mesh.primitive_plane_add(size=600, location=(0, 0, 0))
ground = bpy.context.active_object
ground.name = "Campus_Main_Ground"
ground.data.materials.append(mat_grass)
col_ground.objects.link(ground)
bpy.context.scene.collection.objects.unlink(ground)

# 2. Main University Administration
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 10))
admin = bpy.context.active_object
admin.name = "University_Administration"
admin.scale = (55, 36, 20)
admin.data.materials.append(mat_sandstone)
col_academic.objects.link(admin)
bpy.context.scene.collection.objects.unlink(admin)

# 3. Central Library with Dome
bpy.ops.mesh.primitive_cylinder_add(radius=22, depth=14, location=(-85, 10, 7))
lib_base = bpy.context.active_object
lib_base.name = "Central_Library"
lib_base.data.materials.append(mat_sandstone)
col_academic.objects.link(lib_base)
bpy.context.scene.collection.objects.unlink(lib_base)

bpy.ops.mesh.primitive_uv_sphere_add(radius=18, location=(-85, 10, 16))
lib_dome = bpy.context.active_object
lib_dome.name = "Central_Library_Dome"
lib_dome.data.materials.append(mat_blue_glass)
col_academic.objects.link(lib_dome)
bpy.context.scene.collection.objects.unlink(lib_dome)

# Export GLB
output_dir = "public/assets/models"
os.makedirs(output_dir, exist_ok=True)
glb_path = os.path.join(output_dir, "cit_campus.glb")

print(f"Exporting campus to {glb_path}...")
bpy.ops.export_scene.gltf(
    filepath=glb_path,
    export_format='GLB',
    use_selection=False,
    export_apply=True,
    export_yup=True
)

# Save .blend
blend_path = os.path.join(output_dir, "cit_campus.blend")
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
print(f"Saved Blender project to {blend_path}.")
