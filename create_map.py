import plotly.express as px
import pandas as pd

# Create dataframe with Batman filming locations and supercar factories
data = {
    'name': [
        'Chicago Board of Trade (Batman Begins)',
        'Royal Liver Building Liverpool (The Batman)',
        'Pinewood Studios (Batman 1989)',
        'Heinz Field Pittsburgh (Dark Knight Rises)',
        'Ferrari Factory - Maranello, Italy',
        'McLaren Technology Centre - Woking, UK',
        'Bugatti Factory - Molsheim, France'
    ],
    'latitude': [41.877453, 53.405823, 51.548592, 40.446765, 44.5311, 51.3408, 48.522],
    'longitude': [-87.631989, -2.995956, -0.535414, -80.01576, 10.8661, -0.5423, 7.5002],
    'travel_time': [2.68, 8.81, 9.13, 1.75, 10.72, 9.14, 10.09],
    'type': ['Batman Location', 'Batman Location', 'Batman Location', 'Batman Location',
             'Supercar Factory', 'Supercar Factory', 'Supercar Factory']
}

df = pd.DataFrame(data)

# Add Gotham City (origin point) to the map
gotham_data = {
    'name': ['Gotham City (Origin)'],
    'latitude': [40.7128],
    'longitude': [-74.0060],
    'travel_time': [0.0],
    'type': ['Origin']
}
gotham_df = pd.DataFrame(gotham_data)

# Combine dataframes
df_all = pd.concat([df, gotham_df], ignore_index=True)

# Create the scatter map with color based on travel time
fig = px.scatter_geo(
    df_all,
    lat="latitude",
    lon="longitude",
    text="name",
    color="travel_time",
    size_max=15,
    color_continuous_scale=px.colors.sequential.Magma,
    title="Batman Filming Locations & Supercar Factories - Cargo Plane Travel Time from Gotham",
    labels={"travel_time": "Travel Time (hours)"},
    hover_data={"type": True, "travel_time": ":.2f"},
    projection="natural earth"
)

# Update layout for better visualization
fig.update_layout(
    height=800,
    font=dict(size=12),
    geo=dict(
        showland=True,
        landcolor="rgb(243, 243, 243)",
        coastlinecolor="rgb(204, 204, 204)",
        showlakes=True,
        lakecolor="rgb(255, 255, 255)",
        showcountries=True,
        countrycolor="rgb(204, 204, 204)"
    )
)

# Save the figure
fig.write_image("saved_map.png", width=1600, height=1000)

print("Map saved successfully to saved_map.png!")
print(f"\nTotal locations: {len(df_all)}")
print(f"Batman filming locations: {len(df[df['type'] == 'Batman Location'])}")
print(f"Supercar factories: {len(df[df['type'] == 'Supercar Factory'])}")
print(f"\nTravel times range from {df['travel_time'].min():.2f} to {df['travel_time'].max():.2f} hours")
