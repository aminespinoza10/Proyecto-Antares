using MetadataExtractor;

if (args.Length == 0)
{
	Console.WriteLine("Usage: dotnet run -- <image-path>");
	return;
}

var imagePath = args[0];

if (!File.Exists(imagePath))
{
	Console.WriteLine($"File not found: {imagePath}");
	return;
}

try
{
	var directories = ImageMetadataReader.ReadMetadata(imagePath);

	Console.WriteLine($"Metadata for: {Path.GetFullPath(imagePath)}");
	Console.WriteLine(new string('-', 80));

	foreach (var directory in directories)
	{
		Console.WriteLine($"[{directory.Name}]");

		if (directory.HasError)
		{
			foreach (var error in directory.Errors)
			{
				Console.WriteLine($"  ! {error}");
			}
		}

		foreach (var tag in directory.Tags)
		{
			Console.WriteLine($"  {tag.Name}: {tag.Description}");
		}

		Console.WriteLine();
	}
}
catch (ImageProcessingException ex)
{
	Console.WriteLine($"Could not parse image metadata: {ex.Message}");
}
catch (Exception ex)
{
	Console.WriteLine($"Unexpected error: {ex.Message}");
}
